// Toggle the primary or secondary display settings on the given page

import type { Settings } from '$lib/stores/settings';
import type { Writable } from 'svelte/store';

type DisplayType = 'primary' | 'secondary';

const displayOptions = {
	birthdays: {
		primary: ['full', 'simple'],
		secondary: ['default', 'simple']
	},
	clock: {
		primary: ['analog', 'time', 'date', 'datetime', 'text'],
		secondary: ['time', 'date', 'datetime', 'text', 'none']
	},
	calendar: {
		primary: ['week', 'month', 'month_clock', 'year', 'year_list'],
		secondary: ['full', 'simpledate', 'none']
	},
	pomodoro: {
		primary: ['just_timer', 'combined', 'split'],
		secondary: ['task_list', 'both', 'overview', 'none']
	},
	rubiks: {
		primary: ['timer_and_times', 'timer'],
		secondary: ['scramble', 'times', 'none']
	},
	sunrise: {
		primary: ['none', 'simple', 'full'],
		secondary: ['none', 'simple', 'full']
	},
	weather: {
		primary: ['full', 'simple'],
		secondary: ['daily_hourly', 'daily', 'hourly']
	},
	worldclock: {
		primary: ['analog_digital', 'digital', 'none'],
		secondary: ['rows', 'compact_rows', 'analog_grid', 'digital_grid']
	},
	more: {
		primary: ['default', 'simple'],
		secondary: ['default', 'none']
	}
} as const;

const pages = {
	'/': 'clock',
	'/birthdays': 'birthdays',
	'/calendar': 'calendar',
	'/pomodoro': 'pomodoro',
	'/rubikscube': 'rubiks',
	'/sunrisesunset': 'sunrise',
	'/weather': 'weather',
	'/worldclock': 'worldclock',
	'/more': 'more'
} as const;

type PagePath = keyof typeof pages;

const isValidPage = (page: string): page is PagePath => Object.hasOwn(pages, page);

function toggleDisplay(page: { url: URL }, settings: Writable<Settings>, displayType: DisplayType) {
	const path = page.url.pathname;
	if (!isValidPage(path)) return;
	const currentPage = pages[path];

	settings.update(($settings) => {
		const options = displayOptions[currentPage][displayType];
		const currentDisplay = $settings[currentPage].displays[displayType];
		// @ts-ignore: ts yells when passing anything to indexOf
		const newDisplay = options[(options.indexOf(currentDisplay) + 1) % options.length];

		const newSettings = { ...$settings };
		(newSettings[currentPage].displays[displayType] as string) = newDisplay;

		return newSettings;
	});
}

// List of pages with toggleable displays
export const displayPages = Object.keys(pages);

export default toggleDisplay;
