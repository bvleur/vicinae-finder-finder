# Finder Finder (Vicinae extension)

Jump to Finder from [Vicinae](https://vicinae.com) on macOS, without touching the mouse.

## Commands

- **FinderFinder** (no-view, bind your hotkey to this one)
  - 0 Finder windows: opens a new window, centred (60% x 70% of the main display).
  - 1 window: focuses it.
  - 2+ windows: hands over to *Finder Windows* so you can pick one.
- **Finder Windows** (list): every open Finder window with its folder. Enter focuses it.
  Includes a "Merge all windows into one" item (Finder's *Window > Merge All Windows*).

Preferences:

- *Always show the window list*: skip the direct-focus shortcut and always list windows.
- *Re-activate Finder if focus is taken back* (`keepFocus`, on by default): right after the
  launcher closes, focus can be handed back to the app you came from. When this is on, the
  extension watches for at most 0.8 s and re-activates Finder if that happens. It stops as soon
  as Finder has held focus for ~300 ms and never fights a switch to a different app. Turn it off
  in Vicinae Settings > Extensions > Finder Finder if Finder grabs focus again after you switch away quickly.

## Install

Download `finder-finder.tar.gz` from the [latest release](../../releases/latest) and unpack it in `~/.local/share/vicinae/extensions/finder-finder/`, then restart Vicinae (`vicinae server`). My [dotfiles](https://github.com/bvleur/dotfiles) install it with chezmoi (`.chezmoiexternal`) from a pinned release.

The built command bundles (`finder-finder.js`, `finder-windows.js`) are also committed in the repo root, so cloning the repo into the extensions folder still works without a build:

```bash
git clone git@github.com:bvleur/vicinae-finder-finder.git ~/.local/share/vicinae/extensions/finder-finder
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
  extension can re-activate Finder briefly to compensate (see the *keepFocus* preference).

## Release

<!-- release:start -->
Current version: [v0.1.2](https://github.com/bvleur/vicinae-finder-finder/releases/tag/v0.1.2) ([all release notes](https://github.com/bvleur/vicinae-finder-finder/releases))
<!-- release:end -->

Release from GitHub: **Actions > Release > Run workflow**, pick `major`, `minor` or `patch`. The workflow bumps `package.json` and this README (`scripts/release.sh`), pushes the release commit and tag, builds the extension and creates the GitHub release with generated release notes and `finder-finder.tar.gz` attached.

Or locally:

```bash
scripts/release.sh patch   # or minor / major: bumps package.json and this README, tags and pushes
scripts/release.sh --check # every tag has a GitHub release and this README names the latest version
```

Pushing a `v*` tag by hand runs the same build and release steps. Release notes are the [GitHub releases](../../releases).
