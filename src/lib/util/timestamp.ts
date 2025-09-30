/**
 * Contains timestamp utilities
 *
 * All timestamps are input and output in milliseconds
 * To pass in a timestamp in seconds, `*1000`
 * To convert an output to seconds, `Math.floor(result/1000)`
 */

import { get } from 'svelte/store';

import { settings } from '$lib/stores/settings';

type Units = {
	day: number;
	hour: number;
	min: number;
	sec: number;
	ms: number;
};

// Timestamp ms to string
function timestampToDate(timestamp: number) {
	return new Date(timestamp).toLocaleString(get(settings).locale.datetime ?? 'en', {
		timeZone: get(settings).locale.timezone ?? 'Etc/GMT'
	});
}

// Timestamp ms to utc date string
function timestampToDateGMT(timestamp: number) {
	return new Date(timestamp).toLocaleString(get(settings).locale.datetime ?? 'en', {
		timeZone: 'Etc/GMT'
	});
}

// Date string to time in ms
// returns number in ms if valid, else NaN
function dateToTimestamp(dateString: string) {
	return new Date(dateString).getTime();
}

// Ms to units object
// Currently only used internally in this file
// Note: we must handle negative numbers uniquely
function msToUnits(ms: number) {
	const isNegative = ms < 0;
	const absMs = Math.abs(ms);

	const s = Math.floor(absMs / 1000);
	const milliseconds = absMs % 1000;

	const days = Math.floor(s / (3600 * 24));
	const hours = Math.floor((s % (3600 * 24)) / 3600);
	const minutes = Math.floor((s % 3600) / 60);
	const seconds = s % 60;

	return {
		day: isNegative ? -days : days,
		hour: isNegative ? -hours : hours,
		min: isNegative ? -minutes : minutes,
		sec: isNegative ? -seconds : seconds,
		ms: isNegative ? -milliseconds : milliseconds
	};
}

// todo: in the future when TypeScript provides this then we should be able to delete this line
type RelativeTimeFormatUnit =
	| 'second'
	| 'minute'
	| 'hour'
	| 'day'
	| 'week'
	| 'month'
	| 'quarter'
	| 'year';

// Units object to human readable str
// Uses `Intl.RelativeTimeFormat` to format to appropriate language
// Currently only used internally in this file
function unitsToString({ day, hour, min, sec, ms }: Units, locale: string, doMs: boolean = true) {
	const rtf = new Intl.RelativeTimeFormat(locale, {
		numeric: 'always',
		style: 'long'
	});
	const formatUnit = (value: number, unit: RelativeTimeFormatUnit) =>
		isNaN(value) ? '' : rtf.format(value, unit);

	const dayStr = formatUnit(day, 'day');
	const hourStr = formatUnit(hour, 'hour');
	const minStr = formatUnit(min, 'minute');
	const secStr = formatUnit(sec + (doMs ? ms / 1000 : 0), 'second');

	return `${dayStr}, ${hourStr}, ${minStr}, ${secStr}`;
}

function msToString(ms: number, locale: string) {
	return unitsToString(msToUnits(ms), locale);
}

function sToString(s: number, locale: string) {
	return unitsToString(msToUnits(s * 1000), locale, false);
}

// Other utils with dates/times

/**
 * Returns number of days in a given month and year
 *
 * We would subtract 1 from the month so it is zero-based (Jan is 0, Feb is 1)
 * but then add 1 to go to the next month, since day 0 gives us the last day of the previous month
 * so we simply pass the month as is
 */
function getDaysInMonth(year: number, month: number) {
	return new Date(year, month, 0).getDate();
}

export {
	dateToTimestamp,
	getDaysInMonth,
	msToString,
	sToString,
	timestampToDate,
	timestampToDateGMT
};
