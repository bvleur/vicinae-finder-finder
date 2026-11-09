# Finder Finder (Vicinae extension)

Jump to Finder from [Vicinae](https://vicinae.com) on macOS, without touching the mouse.

## Commands

- **FinderFinder** (no-view, bind your hotkey to this one)
  - 0 Finder windows: opens a new window, centred (60% x 70% of the main display).
  - 1 window: focuses it.
  - 2+ windows: hands over to *Finder Windows* so you can pick one.
- **Finder Windows** (list): every open Finder window with its folder. Enter focuses it.
  Includes a "Merge all windows into one" item (Finder's *Window > Merge All Windows*).

Preference: *Always show the window list* skips the direct-focus shortcut.

## Install

The repo root is the installable extension: the built command bundles are committed, so no build step is needed.

```
finder-finder.js      built "FinderFinder" command (no-view)
finder-windows.js     built "Finder Windows" command (list)
package.json          manifest
assets/               icon
src/                  TypeScript sources (only needed to rebuild)
```

```bash
git clone git@github.com:bvleur/vicinae-finder-finder.git ~/.local/share/vicinae/extensions/finder-finder
vicinae server   # restart so Vicinae picks it up
```

Then assign a hotkey to **FinderFinder** in Vicinae Settings > Extensions.
Command ids: `@bvleur/finder-finder:finder-finder` and `@bvleur/finder-finder:finder-windows`.

To rebuild from source: `npm install && npm run build` (installs into `~/.local/share/vicinae/extensions/finder-finder/`).

## Permissions (macOS)

- **Automation: Vicinae > Finder**, asked once on first use.
- **Accessibility: Vicinae**, only needed for "Merge all windows".

## Known limitations

- Finder reports tabs of a merged window as separate windows via AppleScript, so tabs
  appear as separate entries. A tab cannot be reliably told apart from a window on another Space.
- Vicinae hands focus back to the previous app shortly after the launcher closes; the
  extension re-activates Finder for ~1.2 s to compensate.
