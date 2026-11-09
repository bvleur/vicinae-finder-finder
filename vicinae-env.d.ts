/// <reference types="@vicinae/api">

/*
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 */

type ExtensionPreferences = {
  /** Window list - Skip the direct-focus shortcut and always list Finder windows. */
	"alwaysShowList"?: boolean;

	/** Focus - Right after the launcher closes, macOS/Vicinae may hand focus back to the previous app. When on, Finder is re-activated if that happens (for at most 0.8 s). A deliberate switch to another app is never overridden. Turn off if Finder grabs focus again after you switch away. */
	"keepFocus"?: boolean;
}

declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Command: FinderFinder */
	export type FinderFinder = ExtensionPreferences & {
		
	}

	/** Command: Finder Windows */
	export type FinderWindows = ExtensionPreferences & {
		
	}
}

declare namespace Arguments {
  /** Command: FinderFinder */
	export type FinderFinder = {
		
	}

	/** Command: Finder Windows */
	export type FinderWindows = {
		
	}
}