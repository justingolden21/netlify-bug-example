import type { Writable } from 'svelte/store';
import type { DefaultColors } from 'tailwindcss/types/generated/colors';

import type { Pattern } from '$lib/components/features/misc/BackgroundPattern.svelte';
import type { fontFamilies } from '$lib/data/consts';
import type { Theme } from '$lib/stores/themes';
import localStore from '$lib/util/localStore';
import uid from '$lib/util/uid';

export interface Settings {
	clock: {
		displays: {
			primary: 'time' | 'date' | 'datetime' | 'text' | 'analog';
			secondary: 'time' | 'date' | 'datetime' | 'text' | 'none';
			primaryPalette: string;
			secondaryPalette: string;
			primaryFontSize: string;
			secondaryFontSize: string;
			battery: boolean;
			text: string;
		};
		theme?: null | Theme;
		themeID: null | string;
		timeFormat: null | string;
		timeFormatCustom: null | string;
		dateFormat: string;
		dateFormatCustom: string;
		datetimeFontWeight: string;
	};
	pinnedPages: string[];
	pattern: {
		name: Pattern;
		opacity: 0.05 | 0.1 | 0.15 | 0.2;
		zoom: 1 | 1.5 | 2 | 2.5;
	};
	baseColorPalette: keyof DefaultColors;
	accentColorPalette: keyof DefaultColors;
	darkMode: null | boolean;
	pitchBlackMode: boolean;
	dayNightMode: boolean;
	invertMode: boolean;
	showDarkButton: boolean;
	showPrimaryButton: boolean;
	showSecondaryButton: boolean;
	showAboutButton: boolean;
	showCastButton: boolean;
	showFullscreenButton: boolean;
	smallerMenu: boolean;
	alwaysCollapseMenu: boolean;
	hideTitlebarWhenIdle: boolean;
	secondsUntilIdle: number;
	fontFamily: keyof typeof fontFamilies;
	fontFamilyBody: keyof typeof fontFamilies;
	doubleclickFullscreen: boolean;
	keyboardShortcuts: boolean;
	wakeLock: boolean;
	locale: {
		datetime: null | string;
		language: null | string;
		timezone: null | string;
		automaticDatetime: boolean;
		automaticLanguage: boolean;
		automaticTimezone: boolean;
		metric: null | boolean; // whether or not the user uses metric or usa units
	};
	recentVersion: null | string;
	screenshotMode: boolean;
}

export const defaultSettings = {
	clock: {
		displays: {
			primary: 'time',
			secondary: 'date',
			primaryPalette: 'base',
			secondaryPalette: 'base',
			primaryFontSize: 'large',
			secondaryFontSize: 'large',
			battery: false,
			text: '',
		},

		// legacy support, so this isn't removed by `mergeSettings` until after we read it
		theme: null,

		// null values overridden in _layout onMount to user device's preference
		themeID: null,
		timeFormat: null,
		timeFormatCustom: null,
		dateFormat: 'ddd, MMMM D',
		dateFormatCustom: 'ddd, MMMM D',

		datetimeFontWeight: '300',
	},

	pinnedPages: ['clock', 'worldclock', 'stopwatch', 'timer'],

	// appearance
	pattern: {
		name: 'none',
		opacity: 0.1,
		zoom: 1,
	},
	baseColorPalette: 'slate',
	accentColorPalette: 'red',
	darkMode: null, // overridden in _layout onMount to user device's preference
	pitchBlackMode: false,
	dayNightMode: false,
	invertMode: false,
	showDarkButton: true,
	showPrimaryButton: true,
	showSecondaryButton: true,
	showAboutButton: true,
	showCastButton: false,
	showFullscreenButton: true,
	smallerMenu: false,
	alwaysCollapseMenu: false,
	hideTitlebarWhenIdle: false,
	secondsUntilIdle: 2,
	fontFamily: 'Montserrat',
	fontFamilyBody: 'Bitter',

	// general
	doubleclickFullscreen: false,
	keyboardShortcuts: true,
	wakeLock: false,
	locale: {
		// null values overridden in _layout onMount to user device's preference
		datetime: null,
		language: null,
		timezone: null,
		automaticDatetime: true,
		automaticLanguage: true,
		automaticTimezone: true,
		metric: null,
	},

	// Used for debugging and supporting legacy code
	// mergeDeep requires that it's in the source object (to remove unnecessary keys)
	recentVersion: null,

	// Only true when generating screenshots dynamically, not for the users
	screenshotMode: false,
} satisfies Settings;

// deep copy to preserve original defaultSettings
export const settings = localStore(
	'settings',
	JSON.parse(JSON.stringify(defaultSettings)),
	true
) as Writable<Settings>;
