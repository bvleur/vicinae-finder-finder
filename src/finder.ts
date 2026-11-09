import { execFile } from "node:child_process";
import { promisify } from "node:util";

const run = promisify(execFile);

export type FinderWindow = {
  id: number;
  name: string;
  path: string;
};

async function osascript(script: string): Promise<string> {
  const { stdout } = await run("osascript", ["-e", script]);
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

/** Bring Finder to the front, opening a window if there is none. */
export async function focusFinder(): Promise<void> {
  await osascript(`
    tell application "Finder"
      activate
      if (count of windows) is 0 then make new Finder window
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

export function describeError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  // -1743: Vicinae has not been granted permission to control Finder.
  return message.includes("-1743")
    ? "Allow Vicinae to control Finder in Privacy & Security > Automation"
    : "Could not talk to Finder";
}
