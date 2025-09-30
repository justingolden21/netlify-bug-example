/**
 * Utility functions for rendering dates/times as strings
 * `getDateTime` is primarily used by `DigitalDisplays`, `Worldclocks`, and `WorldclockTimetable` but also used elsewhere
 * Other functions are only used in `Worldclocks`, and `WorldclockTimetable`
 */

import dayjs from 'dayjs';
import tz from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';
import { get } from 'svelte/store';

import '$lib/data/all_locales'; // approx 163kb (comment out and compare build sizes in network tab)
import { settings } from '$lib/stores/settings';

// https://day.js.org/docs/en/plugin/timezone
// https://day.js.org/docs/en/timezone/timezone
dayjs.extend(utc);
dayjs.extend(tz);

/**
 * Get a formatted date or time string
 * @param date - the date/time to format, often `$now` but can be any time
 * @param format - the date format / time format to use for the string (eg. 'h:mm A', 'ddd, MMMM D'). Use `getFormat`
 * @param locale - the datetime locale (eg. 'en')
 * @param timezone - the timezone (eg. 'Etc/GMT')
 */
export const getDateTime = (date: Date, format: string, locale?: string, timezone?: string) => {
	const $settings = get(settings);
	if (locale === undefined) {
		locale = $settings.locale.datetime || 'en';
	}
	if (timezone === undefined) {
		timezone = $settings.locale.timezone || 'Etc/GMT';
	}

	/**
	 *
	 * We use Vanilla JS `Intl` to set the time and timezone
	 * because there is a dayjs bug where setting timezone and locale at same time doesn't work in London.
	 *
	 * We need the specific params listed below to make it work (and reactive and use different times).
	 *
	 * Note that the params listed are just to pass the string into dayjs
	 * and the actual datetime format is the one passed into `getDateTime` and used in `.format()` below.
	 */
	const time = Intl.DateTimeFormat('en', {
		timeZone: timezone,
		hour: 'numeric',
		minute: 'numeric',
		second: 'numeric',
		year: 'numeric',
		month: 'numeric',
		day: 'numeric'
	}).format(date);

	return dayjs(time).locale(locale).format(format);
};

// Offset depends on date since on different days, different timezones will have different offsets
// eg. some timezones have daylight savings time, meaning their offset changes based on the date
// However, to get the offset, we need to pass a timestamp, and timestamp requires correct offset to be accurate
// We solve this chicken-egg problem by setting the tz inside the dayjs object
export const getUtcOffset = (timezone: string, now?: Date) => {
	return dayjs(now ?? new Date())
		.tz(timezone)
		.format('Z');
};

export const getHourDiff = (timezone: string, now: Date) => {
	const $settings = get(settings);

	const currentUtcOffset =
		dayjs(now)
			.tz($settings.locale.timezone || 'Etc/GMT')
			.utcOffset() / 60;
	const tzUtcOffset = dayjs(now).tz(timezone).utcOffset() / 60;
	const diff = tzUtcOffset - currentUtcOffset;
	return `${diff >= 0 ? '+' : ''}${diff}h`;
};
