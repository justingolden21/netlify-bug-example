/**
 * Used for `countdown` mode to calculate how many seconds until the given date and time
 * @param date - the date to countdown until - string in format `YYYY-MM-DD` from `input[type=date]`
 * @param time - the time to countdown until - string in format `HH:MM` from `input[type=time]`
 * @returns number - difference between now and target date and time in seconds
 *
 * This *should* get the correct number of seconds
 * accounting for timezone, daylight savings, leap days, leap seconds etc.
 * by simply converting to UTC timestamp in milliseconds.
 *
 * Concats `date` and `time` with 'T' to produce a date in the format:
 * `YYYY-MM-DDTHH:MM` eg. `2000-01-02T12:34`
 */

import { get } from 'svelte/store';

import { settings } from '$lib/stores/settings';
import { getUtcOffset } from '$lib/util/timeText';

function getSecondsUntil(date: string, time: string, timezone?: string | undefined) {
	const currentUTCTimestamp = new Date().getTime();
	const UTCOffset = getUtcOffset(timezone ?? get(settings).locale.timezone ?? 'Etc/GMT');
	const targetUTCTimestamp = new Date(date + 'T' + time + UTCOffset).getTime();
	return Math.floor((targetUTCTimestamp - currentUTCTimestamp) / 1000);
}

export default getSecondsUntil;
