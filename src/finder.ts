import { execFile } from "node:child_process";
import { appendFileSync, existsSync } from "node:fs";
import { promisify } from "node:util";

const run = promisify(execFile);

export type FinderWindow = {
  id: number;
  name: string;
  path: string;
};

const t0 = Date.now();
/** Timing trace; only active while /tmp/ff-debug exists. */
export function trace(label: string) {
  try {
    if (existsSync("/tmp/ff-debug"))
      appendFileSync("/tmp/ff-trace.log", `${new Date().toISOString()} +${Date.now() - t0}ms ${label}\n`);
  } catch {}
}

async function osascript(script: string): Promise<string> {
  trace("osascript start");
  const { stdout } = await run("osascript", ["-e", script]);
  trace("osascript done");
  return stdout.trim();
}

// One line per window, front to back: "<id>\t<name>\t<posix path>".
// `windows` only contains real Finder windows (not the desktop).
const LIST_SCRIPT = `
tell application "Finder"
  set out to ""
  repeat with i from 1 to (count of windows)
    set w to window i
    set p to ""
    try
      set p to POSIX path of (target of w as alias)
    end try
    set out to out & ((id of w) as string) & "\t" & (name of w) & "\t" & p & linefeed
  end repeat
  return out
end tell
`;

export async function listWindows(): Promise<FinderWindow[]> {
  const out = await osascript(LIST_SCRIPT);
  return out
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [id, name, path] = line.split("\t");
      return { id: Number(id), name, path: path ?? "" };
    });
}

const FINDER_BUNDLE = "com.apple.finder";

async function frontIsFinder(): Promise<boolean> {
  try {
    const { stdout: asn } = await run("lsappinfo", ["front"]);
    const { stdout } = await run("lsappinfo", ["info", "-only", "bundleid", asn.trim()]);
    return stdout.includes(FINDER_BUNDLE);
  } catch {
    return true; // can't tell: don't fight
  }
}

/**
 * Vicinae hands focus back to the previously active app shortly after the
 * launcher closes, which would undo our activation. Run `activate` straight
 * away (no fixed wait), then keep watching for ~1.2 s and re-activate if
 * Finder lost the focus again.
 */
export async function focusGuard(activate: () => Promise<void>): Promise<void> {
  await activate();
  trace("activated");
  for (let i = 0; i < 10; i++) {
    await new Promise((r) => setTimeout(r, 120));
    if (!(await frontIsFinder())) {
      trace("focus lost, re-activating");
      await osascript(`tell application "Finder" to activate`);
    }
  }
  trace("guard done");
}

/** Open a new Finder window centred on the main display (60% x 70%) and focus it. */
export async function openCenteredWindow(): Promise<void> {
  await osascript(`
    tell application "Finder"
      set b to bounds of window of desktop
      set sw to (item 3 of b) - (item 1 of b)
      set sh to (item 4 of b) - (item 2 of b)
      set w to round (sw * 0.6)
      set h to round (sh * 0.7)
      set l to (item 1 of b) + round ((sw - w) / 2)
      set t to (item 2 of b) + round ((sh - h) / 2)
      set nw to make new Finder window
      set bounds of nw to {l, t, l + w, t + h}
      activate
    end tell
  `);
}

/** Bring Finder to the front, opening a centred window if there is none. */
export async function focusFinder(): Promise<void> {
  await osascript(`
    tell application "Finder"
      if (count of windows) is 0 then
        set b to bounds of window of desktop
        set sw to (item 3 of b) - (item 1 of b)
        set sh to (item 4 of b) - (item 2 of b)
        set w to round (sw * 0.6)
        set h to round (sh * 0.7)
        set l to (item 1 of b) + round ((sw - w) / 2)
        set t to (item 2 of b) + round ((sh - h) / 2)
        set nw to make new Finder window
        set bounds of nw to {l, t, l + w, t + h}
      end if
      activate
    end tell
  `);
}

/** Raise one specific Finder window (un-minimising it if needed). */
export async function focusWindow(id: number): Promise<void> {
  await osascript(`
    tell application "Finder"
      set w to window id ${Math.trunc(id)}
      if collapsed of w then set collapsed of w to false
      set index of w to 1
      activate
    end tell
  `);
}

/** Click Finder's Window > Merge All Windows (needs Accessibility for Vicinae). */
export async function mergeAllWindows(): Promise<void> {
  await osascript(`
    tell application "Finder" to activate
    tell application "System Events"
      tell process "Finder"
        set wm to (first menu bar item of menu bar 1 whose name is "Window" or name is "Venster")
        set mi to missing value
        repeat with m in (menu items of menu 1 of wm)
          set n to ""
          try
            set n to name of m
          end try
          if n is "Merge All Windows" or n is "Alle vensters samenvoegen" or n is "Voeg alle vensters samen" then
            set mi to m
            exit repeat
          end if
        end repeat
        if mi is missing value then error "merge menu item not found"
        click mi
      end tell
    end tell
  `);
}

export function describeError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  // -1743: Vicinae has not been granted permission to control Finder.
  if (message.includes("-1743"))
    return "Allow Vicinae to control Finder in Privacy & Security > Automation";
  if (message.includes("-1719") || message.includes("-25211"))
    return "Allow Vicinae in Privacy & Security > Accessibility";
  return "Could not talk to Finder";
}
