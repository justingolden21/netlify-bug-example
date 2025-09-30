/**
 * This module provides utilities for managing events with optional recurrence patterns.
 * Events are represented by their original start date and time, and recurrence supports daily, weekly, monthly, and yearly patterns.
 * The specific monthly/yearly recurrence rule (eg. "on the 15th" vs. "on the third Tuesday") is derived from the event's `originalDate`, not stored separately.
 * Includes functions for creating events, calculating occurrences, and retrieving events within a date range.
 */

import type { HighlightedDay } from '$lib/components/pages/calendar/CalendarMonth.svelte';
import getTranslatedTimefield from '$lib/util/getTranslatedTimefield';
import { getMonthNames, getWeekNames } from '$lib/util/getWeekMonthNames';
import { minsToTimeStr } from '$lib/util/timetableDiff';

export interface CalendarEvent {
	id: string;
	title: string;
	originalDate: {
		year: number;
		month: number; // 0-11
		day: number; // 1-31
	};
	// Times in minutes since midnight
	startTimeInMinutes?: number;
	endTimeInMinutes?: number;
	date?: Date; // Dynamically set for specific occurrences
	recurrence?: RecurrencePattern;
}

interface BaseRecurrence {
	frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
	interval: number;
	end?: { type: 'count'; value: number } | { type: 'until'; value: Date | null };
}

interface DailyRecurrence extends BaseRecurrence {
	frequency: 'daily';
}

interface WeeklyRecurrence extends BaseRecurrence {
	frequency: 'weekly';
	daysOfWeek: number[]; // 0=Sun, 6=Sat
}

/**
 * Monthly recurrence now only stores the *type* of recurrence.
 * The specific day or weekday is derived from the event's `originalDate`.
 */
interface MonthlyRecurrence extends BaseRecurrence {
	frequency: 'monthly';
	/**
	 * Recurrence based on a specific day of month, the Nth weekday, or the last weekday.
	 */
	monthlyType: 'dayOfMonth' | 'nthWeekday' | 'lastWeekday';
}

/**
 * Yearly recurrence now only stores the *type* of recurrence.
 * The specific month, day, or weekday is derived from the event's `originalDate`.
 */
interface YearlyRecurrence extends BaseRecurrence {
	frequency: 'yearly';
	/**
	 * Recurrence based on a specific day of month, the Nth weekday, or the last weekday of a month.
	 */
	yearlyType: 'dayOfMonth' | 'nthWeekday' | 'lastWeekday';
}

export type RecurrencePattern =
	| DailyRecurrence
	| WeeklyRecurrence
	| MonthlyRecurrence
	| YearlyRecurrence;

/**
 * Create a UTC date from year, month, and day.
 *
 * We use this to avoid problems when `new Date(year, month, day)` interprets values in user's local timezone.
 * Because event manager relies on UTC getters (eg. `getUTCMonth`, `getUTCDate`), creating dates in UTC keeps recurrence calculations consistent
 *
 * @param year - Full year
 * @param month - Zero-indexed month
 * @param day - Day of month
 */
export function createUtcDate(year: number, month: number, day: number): Date {
	return new Date(Date.UTC(year, month, day));
}

/**
 * Add days to a date without mutating the original.
 *
 * Used to search for recurrences for an event
 *
 * @param date - Base date
 * @param days - Days to add
 */
function addDays(date: Date, days: number): Date {
	const newDate = new Date(date);
	newDate.setUTCDate(newDate.getUTCDate() + days);
	return newDate;
}

/**
 * Normalize an "until" recurrence end value to a {@link Date}.
 * Serialized events may restore the end value as a string; this converts it
 * back to a Date so later logic can rely on Date methods without throwing.
 */
function getUntilDate(recurrence?: RecurrencePattern): Date | undefined {
	if (recurrence?.end?.type !== 'until') return undefined;
	const value = recurrence.end.value;
	if (!value) return undefined;
	return value instanceof Date ? value : new Date(value);
}

/**
 * Get the date of the nth weekday in a month.
 *
 * Used by `getNextOccurrence` to determine what the nth weekday of the month is for recurrence purposes
 * Eg. determining the 4th Thurs in November
 *
 * @param year - Full year
 * @param month - Zero-indexed month
 * @param weekday - Day of week, 0-6
 * @param n - Occurrence number or 'last'
 */
export function getNthWeekdayOfMonth(
	year: number,
	month: number,
	weekday: number,
	n: number | 'last'
): Date | null {
	// Invalid weekday
	if (weekday < 0 || weekday > 6) return null;

	// Go to last day of month, then go back until the day is `weekday`
	if (n === 'last') {
		const lastDayOfMonth = new Date(Date.UTC(year, month + 1, 0));
		const date = new Date(lastDayOfMonth);
		date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() - weekday + 7) % 7));
		return date;
	}

	// Set date to first of month, go to first occurence of `weekday`, then add `n-1` weeks
	const firstDayOfMonth = createUtcDate(year, month, 1);
	const date = new Date(firstDayOfMonth);
	date.setUTCDate(1 + ((weekday - firstDayOfMonth.getUTCDay() + 7) % 7));
	date.setUTCDate(date.getUTCDate() + (n - 1) * 7);

	// Return `null` if it doesn't exist (eg. this month doesn't have a 5th Tues)
	return date.getUTCMonth() === month ? date : null;
}

/**
 * Determine the occurrence number of a weekday within its month.
 *
 * Used to determine what weekday of month recurrence pattern would be applicable to the current event's original date
 * Eg. an event is originally on Jan 2, and we use this function to determine that is the "first, tuesday, not last tuesday" of the month
 *
 * @param date - Date to check
 * @returns The occurrence number (1-5), the weekday index, and whether it's the last occurrence of that weekday in the month
 */
export function findNthWeekdayOccurrence(date: Date): {
	n: number;
	weekday: number;
	isLast: boolean;
} {
	const month = date.getUTCMonth();
	const day = date.getUTCDate();
	const weekday = date.getUTCDay();

	// nth week of month
	const n = Math.ceil(day / 7);

	// If one week later is next month, then it must be the last of that weekday this month
	const nextWeekDate = new Date(date);
	nextWeekDate.setUTCDate(day + 7);
	const isLast = nextWeekDate.getUTCMonth() !== month;

	return { n, weekday, isLast };
}

/**
 * Validates a {@link CalendarEvent} ensuring dates and recurrence options are sane.
 *
 * Used by `NewEventModal.svelte` to determine if the newly created event is valid
 *
 * @returns `true` when the event can be safely stored or scheduled, else false
 */
export function isEventValid(event: CalendarEvent): boolean {
	const { originalDate, startTimeInMinutes, endTimeInMinutes, recurrence } = event;

	// End time must be after start time
	if (
		startTimeInMinutes !== undefined &&
		endTimeInMinutes !== undefined &&
		endTimeInMinutes <= startTimeInMinutes
	) {
		return false;
	}

	// Non-recurring events require no further checks
	if (!recurrence) return true;

	// Interval must be a positive integer
	if (!Number.isInteger(recurrence.interval) || recurrence.interval < 1) {
		return false;
	}

	// Validate weekly-specific fields
	if (recurrence.frequency === 'weekly') {
		// Weekly patterns need at least one weekday
		if (recurrence.daysOfWeek.length === 0) {
			return false;
		}
		// Weekdays must be integers between 0 and 6
		if (recurrence.daysOfWeek.some((d) => !Number.isInteger(d) || d < 0 || d > 6)) {
			return false;
		}
	}

	if (recurrence.end) {
		if (recurrence.end.type === 'count') {
			// Count-based end needs a positive integer
			if (!Number.isInteger(recurrence.end.value) || recurrence.end.value < 1) {
				return false;
			}
		} else if (recurrence.end.type === 'until') {
			const start = createUtcDate(originalDate.year, originalDate.month, originalDate.day);
			const untilDate = getUntilDate(recurrence);
			if (!untilDate || Number.isNaN(untilDate.getTime())) return false;
			const end = createUtcDate(
				untilDate.getUTCFullYear(),
				untilDate.getUTCMonth(),
				untilDate.getUTCDate()
			);
			// End date cannot be before the start date
			if (end.getTime() < start.getTime()) return false;
		}
	}

	return true;
}

/**
 * Get the next occurrence of a recurring event after a given date.
 * Respects both "until" and "count" recurrence end conditions.
 *
 * @param event - Event to evaluate
 * @param afterDateRaw - Date to search after
 */
export function getNextOccurrence(event: CalendarEvent, afterDateRaw: Date): Date | null {
	// ========
	// Early exits, normalization, and common helpers
	// ========

	const recurrence = event.recurrence;
	if (!recurrence) return null;

	// Normalize original date to UTC
	const originalDate = createUtcDate(
		event.originalDate.year,
		event.originalDate.month,
		event.originalDate.day
	);

	// Work on a cloned "search after" date so we don't mutate the caller's object
	const afterDate = new Date(afterDateRaw);

	// Validate interval
	const interval = recurrence.interval ?? 1;
	if (!Number.isInteger(interval) || interval < 1) return null;

	// ========
	// Upper bound "until" handling. If present, convert to a UTC end-of-day cap.
	// If the search date is already past the end, no future occurrences exist.
	// ========
	const until = getUntilDate(recurrence);
	const endDate =
		until !== undefined
			? createUtcDate(until.getUTCFullYear(), until.getUTCMonth(), until.getUTCDate())
			: null;

	if (endDate && afterDate.getTime() >= endDate.getTime()) return null;

	// Helper: check if strictly after `afterDate`
	const isAfter = (date: Date) => date.getTime() > afterDate.getTime();

	// ========
	// Daily
	// Advance in day-sized intervals; honor "count" and "until".
	// `occurrenceIndex` counts from 1 (the original instance).
	// ========
	if (recurrence.frequency === 'daily') {
		const daysSinceOriginal = Math.floor(
			(afterDate.getTime() - originalDate.getTime()) / (1000 * 60 * 60 * 24)
		);
		// Skip whole intervals that have already elapsed, then move to the next one.
		const intervalsToSkip = Math.floor(daysSinceOriginal / interval) + 1;
		const nextDate = addDays(originalDate, intervalsToSkip * interval);

		// Respect "until"
		if (endDate && nextDate.getTime() > endDate.getTime()) return null;

		// Respect "count" (original instance is index 1)
		const occurrenceIndex = intervalsToSkip + 1;
		if (recurrence.end?.type === 'count' && occurrenceIndex > recurrence.end.value) {
			return null;
		}
		return nextDate;
	}

	// ========
	// Weekly
	// Support multiple weekdays within each active week and an interval measured in weeks.
	// We compute the next candidate weekday > afterDate while respecting both "until" and "count".
	// ========
	if (recurrence.frequency === 'weekly') {
		if (recurrence.daysOfWeek.length === 0) return null;

		const weekdays = recurrence.daysOfWeek;
		const sortedWeekdays = [...weekdays].sort((a, b) => a - b);
		const weekMs = 7 * 24 * 60 * 60 * 1000;

		// Count how many actual occurrences have happened up to and including `date`.
		// This is used to enforce a "count" end condition.
		const countOccurrencesUpTo = (date: Date): number => {
			const weekDiff = Math.floor((date.getTime() - originalDate.getTime()) / weekMs);
			if (weekDiff < 0) return 0;

			const originalWeekday = originalDate.getUTCDay();
			const candidateWeekday = date.getUTCDay();
			let count = 0;

			// First (possibly partial) week: only count days on/after the original weekday
			if (weekDiff === 0) {
				for (const d of sortedWeekdays) {
					if (d >= originalWeekday && d <= candidateWeekday) count++;
				}
				return count;
			}

			// Count remaining days in the original week from the original weekday onward
			count += sortedWeekdays.filter((d) => d >= originalWeekday).length;

			// Full weeks strictly between original week and candidate's week
			const fullWeeksBetween = weekDiff - 1;
			const activeWeeks = Math.floor(fullWeeksBetween / interval);
			count += activeWeeks * sortedWeekdays.length;

			// If the candidate's week aligns with an active interval week,
			// add any weekdays up to and including the candidate weekday.
			if (weekDiff % interval === 0) {
				for (const d of sortedWeekdays) {
					if (d <= candidateWeekday) count++;
				}
			}

			return count;
		};

		// Start searching strictly after `afterDate`
		const searchDate = addDays(afterDate, 1);
		const originalWeekStart = originalDate.getTime();
		const weeksSinceOriginal = Math.floor((searchDate.getTime() - originalWeekStart) / weekMs);
		// Align search to the first active interval week so we don't skip weeks
		// when the interval is greater than 1
		let intervalBlock = Math.floor(weeksSinceOriginal / interval);
		let nextCandidate: Date | null = null;

		while (!nextCandidate) {
			// Jump forward in blocks of `interval` weeks from the original week
			const weekStart = addDays(originalDate, intervalBlock * 7 * interval);

			// Scan the 7 days of this active week to find the first valid weekday > afterDate
			for (let i = 0; i < 7; i++) {
				const candidate = addDays(weekStart, i);
				if (weekdays.includes(candidate.getUTCDay()) && isAfter(candidate)) {
					// Respect "until"
					if (endDate && candidate.getTime() > endDate.getTime()) return null;

					// Respect "count"
					const occurrenceIndex = countOccurrencesUpTo(candidate);
					if (recurrence.end?.type === 'count' && occurrenceIndex > recurrence.end.value) {
						return null;
					}
					nextCandidate = candidate;
					break;
				}
			}

			// Move to the next block of active weeks if nothing found yet
			intervalBlock++;

			// If even the end of this week exceeds the "until" date, we can stop
			if (endDate && addDays(weekStart, 6).getTime() > endDate.getTime()) return null;
		}
		return nextCandidate;
	}

	// ========
	// Monthly
	// Supports:
	//  - `dayOfMonth`: eg. "31st" of month (skipping invalid)
	//  - `nthWeekday`: eg. "2nd Monday" of month
	//  - `lastWeekday`: eg. "last Monday" of month
	// Iterate forward month-by-month in steps of `interval`, pick the first
	// candidate strictly after `afterDate`, then enforce "until" and "count".
	// ========
	if (recurrence.frequency === 'monthly') {
		const year = originalDate.getUTCFullYear();
		const month = originalDate.getUTCMonth();

		const baseDay = originalDate.getUTCDate();
		const { n, weekday } = findNthWeekdayOccurrence(originalDate);

		const monthsSinceOriginal =
			(afterDate.getUTCFullYear() - year) * 12 + (afterDate.getUTCMonth() - month);
		const intervalCount = Math.floor(monthsSinceOriginal / interval) + 1;

		for (let i = intervalCount; i < intervalCount + 100; i++) {
			const nextMonth = month + i * interval;
			const nextYear = year + Math.floor(nextMonth / 12);
			const nextMonthIndex = nextMonth % 12;

			let candidate: Date | null = null;

			if (recurrence.monthlyType === 'dayOfMonth') {
				// Same day number; if invalid (eg. Feb 30), skip
				candidate = createUtcDate(nextYear, nextMonthIndex, baseDay);
				if (candidate.getUTCMonth() !== nextMonthIndex) continue;
			} else if (recurrence.monthlyType === 'nthWeekday') {
				// eg. 2nd Monday of the month
				candidate = getNthWeekdayOfMonth(nextYear, nextMonthIndex, weekday, n);
			} else if (recurrence.monthlyType === 'lastWeekday') {
				// eg. last Monday of the month
				candidate = getNthWeekdayOfMonth(nextYear, nextMonthIndex, weekday, 'last');
			}

			if (candidate && isAfter(candidate)) {
				// Respect "until"
				if (endDate && candidate.getTime() > endDate.getTime()) return null;

				// Respect "count" (original is index 1, so +1 from loop counter)
				const occurrenceIndex = i + 1;
				if (recurrence.end?.type === 'count' && occurrenceIndex > recurrence.end.value) {
					return null;
				}
				return candidate;
			}
		}
		return null;
	}

	// ========
	// Yearly
	// Similar logic to monthly but once per year in the same (original date's) month.
	// Supports:
	//  - `dayOfMonth`: eg. "31st" of month (skipping invalid)
	//  - `nthWeekday`: eg. "2nd Monday" of month
	//  - `lastWeekday`: eg. "last Monday" of month
	// ========
	if (recurrence.frequency === 'yearly') {
		const year = originalDate.getUTCFullYear();
		const month = originalDate.getUTCMonth();
		const day = originalDate.getUTCDate();
		const { n, weekday } = findNthWeekdayOccurrence(originalDate);

		const yearsSinceOriginal = afterDate.getUTCFullYear() - year;
		// Determine how many interval blocks have elapsed up to `afterDate`
		// so we start searching from the correct year and don't skip the
		// current year when the event hasn't yet occurred
		const intervalCount = Math.floor(yearsSinceOriginal / interval);

		for (let i = intervalCount; i < intervalCount + 100; i++) {
			const nextYear = year + i * interval;
			let candidate: Date | null = null;

			if (recurrence.yearlyType === 'dayOfMonth') {
				// Same month/day; invalids (eg. Feb 30) are skipped.
				candidate = createUtcDate(nextYear, month, day);
				if (candidate.getUTCMonth() !== month) continue;
			} else if (recurrence.yearlyType === 'nthWeekday') {
				candidate = getNthWeekdayOfMonth(nextYear, month, weekday, n);
			} else if (recurrence.yearlyType === 'lastWeekday') {
				candidate = getNthWeekdayOfMonth(nextYear, month, weekday, 'last');
			}

			if (candidate && isAfter(candidate)) {
				// Respect "until"
				if (endDate && candidate.getTime() > endDate.getTime()) return null;

				// Respect "count"
				const occurrenceIndex = i + 1;
				if (recurrence.end?.type === 'count' && occurrenceIndex > recurrence.end.value) {
					return null;
				}
				return candidate;
			}
		}
		return null;
	}

	// Frequency not recognized - there is no next occurrence
	return null;
}

/**
 * Collect event occurrences within a date range.
 *
 * Used by display functions below
 *
 * @param events - Source events
 * @param startDate - Range start
 * @param endDate - Range end
 */
export function getEventsInRange(
	events: CalendarEvent[],
	startDate: Date,
	endDate: Date
): CalendarEvent[] {
	const eventsInRange: CalendarEvent[] = [];
	const startTimestamp = startDate.getTime();
	const endTimestamp = new Date(endDate).setUTCHours(23, 59, 59, 999);

	const MAX_OCCURRENCES = 1000;

	for (const event of events) {
		const originalEventDate = createUtcDate(
			event.originalDate.year,
			event.originalDate.month,
			event.originalDate.day
		);

		// One-time event
		if (!event.recurrence) {
			if (
				originalEventDate.getTime() >= startTimestamp &&
				originalEventDate.getTime() <= endTimestamp
			) {
				eventsInRange.push({ ...event, date: originalEventDate });
			}
			continue;
		}

		// Recurring events: find first occurrence within/after range

		let currentOccurrence: Date | null = originalEventDate;
		if (currentOccurrence.getTime() < startTimestamp) {
			// Fast-forward just before the range, then ask for the next one
			currentOccurrence =
				getNextOccurrence(event, addDays(startDate, -1)) ?? new Date(endTimestamp + 1);
		}

		// Collect occurrences within the range (with a hard cap)

		let iterationLimit = 0;

		while (
			currentOccurrence !== null &&
			currentOccurrence.getTime() <= endTimestamp &&
			iterationLimit < MAX_OCCURRENCES
		) {
			if (currentOccurrence.getTime() >= startTimestamp) {
				eventsInRange.push({ ...event, date: new Date(currentOccurrence) });
			}
			currentOccurrence = getNextOccurrence(event, currentOccurrence);
			iterationLimit++;
		}

		if (iterationLimit >= MAX_OCCURRENCES) {
			console.warn(`Too many occurrences for event ${event.id} (${event.title}).`);
		}
	}

	// Sort by date and return
	return eventsInRange.sort((a, b) => (a.date?.getTime() || 0) - (b.date?.getTime() || 0));
}

/**
 * Map events to calendar day highlights for a month.
 *
 * Finds all given events in the given range and converts them to highlighted day format
 * `Used by CalendarYearList.svelte`
 *
 * @param events - Events to consider
 * @param year - Target year
 * @param month - Zero-indexed month
 */
export function getEventsAsHighlightedDays(
	events: CalendarEvent[],
	year: number,
	month: number
): HighlightedDay[] {
	const startDate = createUtcDate(year, month, 1);
	const endDate = createUtcDate(year, month + 1, 0);
	const eventsInMonth = getEventsInRange(events, startDate, endDate);
	const highlightedDays: HighlightedDay[] = [];

	for (const event of eventsInMonth) {
		if (event.date) {
			highlightedDays.push({
				id: event.id,
				month: event.date.getUTCMonth(),
				day: event.date.getUTCDate(),
				year: event.date.getUTCFullYear(),
				title: event.title,
				startTimeInMinutes: event.startTimeInMinutes,
				endTimeInMinutes: event.endTimeInMinutes
			});
		}
	}

	return highlightedDays;
}

/**
 * Get highlighted events for a month view including the leading and trailing days
 * from adjacent months that appear in the calendar grid.
 *
 * @param events - All calendar events
 * @param year - Target year
 * @param month - Zero-indexed month for the view
 */
export function getMonthViewEvents(
	events: CalendarEvent[],
	year: number,
	month: number
): HighlightedDay[] {
	const firstOfMonth = createUtcDate(year, month, 1);
	const start = new Date(firstOfMonth);
	start.setUTCDate(start.getUTCDate() - start.getUTCDay());

	const end = new Date(start);
	end.setUTCDate(end.getUTCDate() + 41); // 6 weeks

	const eventsInRange = getEventsInRange(events, start, end);
	const highlightedDays: HighlightedDay[] = [];

	for (const event of eventsInRange) {
		if (event.date) {
			highlightedDays.push({
				id: event.id,
				month: event.date.getUTCMonth(),
				day: event.date.getUTCDate(),
				year: event.date.getUTCFullYear(),
				title: event.title,
				startTimeInMinutes: event.startTimeInMinutes,
				endTimeInMinutes: event.endTimeInMinutes
			});
		}
	}

	return highlightedDays;
}

/**
 * Get highlighted events for a week view based on a reference date. The week
 * begins on Sunday and includes events from adjoining months.
 *
 * @param events - All calendar events
 * @param baseDate - Any date within the week
 */
export function getWeekViewEvents(events: CalendarEvent[], baseDate: Date): HighlightedDay[] {
	// Use the local date parts so the computed week aligns with what the user sees
	const start = createUtcDate(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
	// Shift back to the Sunday of the current (local) week
	start.setUTCDate(start.getUTCDate() - baseDate.getDay());

	const end = new Date(start);
	end.setUTCDate(end.getUTCDate() + 6);

	const eventsInRange = getEventsInRange(events, start, end);
	const highlightedDays: HighlightedDay[] = [];

	for (const event of eventsInRange) {
		if (event.date) {
			highlightedDays.push({
				id: event.id,
				month: event.date.getUTCMonth(),
				day: event.date.getUTCDate(),
				year: event.date.getUTCFullYear(),
				title: event.title,
				startTimeInMinutes: event.startTimeInMinutes,
				endTimeInMinutes: event.endTimeInMinutes
			});
		}
	}

	return highlightedDays;
}

/**
 * Build a human-readable description of an event and its recurrence.
 *
 * @param event - Event to describe
 * @param ampm - Use 12-hour clock
 * @param dictionary - Language dictionary
 * @param locale - Locale code for language-specific strings
 */
export function getEventDescription(
	event: CalendarEvent,
	ampm: boolean | undefined,
	dictionary: Record<string, any>,
	locale: string = 'en'
): string {
	if (!dictionary?.calendarEvents) return '';
	const { originalDate, startTimeInMinutes, endTimeInMinutes, recurrence } = event;
	const date = createUtcDate(originalDate.year, originalDate.month, originalDate.day);

	const months = getMonthNames(locale, 'long');
	const dayNames = getWeekNames(locale, 'long');
	const dict = dictionary.calendarEvents;

	function formatOrdinal(n: number, locale: string) {
		const s = ['th', 'st', 'nd', 'rd'],
			v = n % 100;
		return locale.startsWith('en') ? `${n}${s[(v - 20) % 10] || s[v] || s[0]}` : `${n}`;
	}

	const dateStr = `${months[originalDate.month]} ${formatOrdinal(originalDate.day, locale)}, ${originalDate.year}`;
	let description = dict['Starts on {{date}}'].replace('{{date}}', dateStr);

	if (startTimeInMinutes !== undefined) {
		description +=
			' ' + dict['at {{time}}'].replace('{{time}}', minsToTimeStr(startTimeInMinutes, ampm));
		if (endTimeInMinutes !== undefined) {
			description += ` - ${minsToTimeStr(endTimeInMinutes, ampm)}`;
		}
	}

	if (!recurrence) {
		return description + ' ' + dict['and does not repeat.'];
	}

	const everyWord = (dict['Every'] || 'Every').toLowerCase();
	const intervalText = recurrence.interval > 1 ? `${everyWord} ${recurrence.interval}` : everyWord;
	const unitMap = { daily: 'day', weekly: 'week', monthly: 'month', yearly: 'year' } as const;
	const unit = unitMap[recurrence.frequency];
	const frequencyText = getTranslatedTimefield(locale, unit, recurrence.interval > 1).toLowerCase();

	description +=
		' ' +
		dict['and repeats {{interval}} {{frequency}}']
			.replace('{{interval}}', intervalText)
			.replace('{{frequency}}', frequencyText);

	if (recurrence.frequency === 'weekly') {
		const days = [...recurrence.daysOfWeek].sort((a, b) => a - b);
		const dayNamesList = days.map((d) => dayNames[d]).join(', ');
		description += ' ' + dict['on {{days}}'].replace('{{days}}', dayNamesList);
	} else if (recurrence.frequency === 'monthly') {
		if (recurrence.monthlyType === 'dayOfMonth') {
			const nth = formatOrdinal(originalDate.day, locale);
			description += ' ' + dict['on the {{nth}} day'].replace('{{nth}}', nth);
		} else if (recurrence.monthlyType === 'nthWeekday') {
			const { n, weekday } = findNthWeekdayOccurrence(date);
			const nText = formatOrdinal(n, locale);
			description +=
				' ' +
				dict['on the {{nth}} {{weekday}}']
					.replace('{{nth}}', nText)
					.replace('{{weekday}}', dayNames[weekday]);
		} else if (recurrence.monthlyType === 'lastWeekday') {
			const { weekday } = findNthWeekdayOccurrence(date);
			const lastText = (dict['Last'] || 'last').toLowerCase();
			description +=
				' ' +
				dict['on the {{nth}} {{weekday}}']
					.replace('{{nth}}', lastText)
					.replace('{{weekday}}', dayNames[weekday]);
		}
	} else if (recurrence.frequency === 'yearly') {
		if (recurrence.yearlyType === 'dayOfMonth') {
			const dayStr = formatOrdinal(originalDate.day, locale);
			description +=
				' ' +
				dict['on {{month}} {{day}}']
					.replace('{{month}}', months[originalDate.month])
					.replace('{{day}}', dayStr);
		} else if (recurrence.yearlyType === 'nthWeekday') {
			const { n, weekday } = findNthWeekdayOccurrence(date);
			const nText = formatOrdinal(n, locale);
			description +=
				' ' +
				dict['on the {{nth}} {{weekday}} of {{month}}']
					.replace('{{nth}}', nText)
					.replace('{{weekday}}', dayNames[weekday])
					.replace('{{month}}', months[originalDate.month]);
		} else if (recurrence.yearlyType === 'lastWeekday') {
			const { weekday } = findNthWeekdayOccurrence(date);
			const lastText = (dict['Last'] || 'last').toLowerCase();
			description +=
				' ' +
				dict['on the {{nth}} {{weekday}} of {{month}}']
					.replace('{{nth}}', lastText)
					.replace('{{weekday}}', dayNames[weekday])
					.replace('{{month}}', months[originalDate.month]);
		}
	}

	if (recurrence.end) {
		if (recurrence.end.type === 'count') {
			description +=
				' ' + dict['for {{count}} occurrences.'].replace('{{count}}', String(recurrence.end.value));
		} else if (recurrence.end.type === 'until') {
			const endDate = getUntilDate(recurrence);
			if (endDate) {
				const endStr = `${months[endDate.getUTCMonth()]} ${formatOrdinal(
					endDate.getUTCDate(),
					locale
				)}, ${endDate.getUTCFullYear()}`;
				description += ' ' + dict['until {{date}}.'].replace('{{date}}', endStr);
			}
		}
	} else {
		description += ' ' + dict['forever.'];
	}

	return description;
}
