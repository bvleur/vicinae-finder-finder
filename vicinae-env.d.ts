/// <reference types="@vicinae/api">

/*
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 */

type ExtensionPreferences = {
  /** Window list - Skip the direct-focus shortcut and always list Finder windows. */
	"alwaysShowList"?: boolean;
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