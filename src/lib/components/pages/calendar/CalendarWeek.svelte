<script lang="ts">
	import { fly, scale } from 'svelte/transition';
	import type { HighlightedDay } from '$lib/components/pages/calendar/CalendarMonth.svelte';
	import { dictionary } from '$lib/stores/languageDictionary';
	import { settings } from '$lib/stores/settings';
	import { getMonthNames, getWeekNames } from '$lib/util/getWeekMonthNames';
	import { getWeekViewEvents } from '$lib/util/eventManager';

	// Type used for this file, which guarentees that the event has start and end times
	// Created by `getDayEvents` which filters out events without start and sets end times for events with only start
	interface CalendarWeekEvent extends HighlightedDay {
		start: number; // Start time in minutes since midnight
		end: number; // End time in minutes since midnight
	}

	interface Props {
		createCallback?: (day: number, month: number, year: number, timeString?: number) => void;
		editCallback?: (id: string) => void;
	}
	let { createCallback = () => {}, editCallback = () => {} }: Props = $props();

	const locale = $derived($settings.locale.datetime ?? 'en');
	const monthNames = $derived(getMonthNames(locale, 'long'));
	const weekdayNames = $derived(getWeekNames(locale, 'short'));

	// Init to today
	let date = $state(new Date());
	const currYear = $derived(date.getFullYear());
	const currMonth = $derived(date.getMonth());

	const todayWeekday = $derived(date.getDay());
	const todayMonthday = $derived(date.getDate());

	const daysInPreviousMonth = $derived(new Date(currYear, currMonth, 0).getDate());
	const daysInCurrentMonth = $derived(new Date(currYear, currMonth + 1, 0).getDate());

	const eventsEnabled = $derived($settings.calendar.eventsEnabled);
	const showEventsWhenPrinting = $derived($settings.calendar.showEventsWhenPrinting);
	const highlightedDays = $derived(
		(() => {
			if (!eventsEnabled) return [];
			return getWeekViewEvents($settings.calendar.events, date);
		})()
	);

	export function gotoToday() {
		date = new Date();
	}

	export function prev() {
		// Prev week - go back 7 days
		date = new Date(date.getTime() - 7 * 24 * 60 * 60 * 1000);
	}

	export function next() {
		// Next week - go forward 7 days
		date = new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000);
	}

	// TODO future: option for custom shorter time range (ex. 9am-5pm)
	const times = $derived(
		Array.from({ length: 24 }, (_, h) =>
			new Date(0, 0, 0, h).toLocaleTimeString($settings.locale.datetime ?? 'en', {
				hour: 'numeric',
				hour12: $settings.calendar.ampm ?? undefined
			})
		)
	);

	// Helper: get events for a given day, sorted by time
	function getDayEvents(day: number, month: number, year: number) {
		return highlightedDays
			.filter(
				(e) =>
					e.month === month &&
					e.day === day &&
					e.year === year &&
					e.startTimeInMinutes !== undefined
			)
			.map((e) => ({
				...e,
				start: e.startTimeInMinutes ?? 0,
				end: e.endTimeInMinutes ?? e.startTimeInMinutes! + 60 // default 1 hour if no end
			}))
			.sort((a, b) => a.start - b.start) as CalendarWeekEvent[];
	}

	// Helper: get events that overlap a given hour slot
	function getEventsForHour(day: number, month: number, year: number, hour: number) {
		const events = getDayEvents(day, month, year);
		const slotStart = hour * 60;
		const slotEnd = (hour + 1) * 60;
		return events.filter((e) => e.start < slotEnd && e.end > slotStart);
	}

	/**
	 * Returns the maximum number of overlapping events for a given event.
	 * This considers all events that overlap with any part of the event's duration,
	 * including those that start after this event but before it ends.
	 * This is necessary so that a long event that is only overlapped by other events
	 * in the middle or end will still be rendered with the correct width (not full width).
	 */
	function getMaxOverlappingEvents(event: CalendarWeekEvent, allEvents: CalendarWeekEvent[]) {
		let maxOverlap = 1;
		const start = event.start;
		const end = event.end;
		// Collect all unique time points (start or end of any event within this event's span)
		const timePoints = [];
		for (const e of allEvents) {
			if (e.end > start && e.start < end) {
				timePoints.push(e.start, e.end);
			}
		}
		// Sort and dedupe
		const uniquePoints = Array.from(new Set(timePoints)).sort((a, b) => a - b);
		// For each time point, count how many events are active at that time
		for (const t of uniquePoints) {
			let count = 0;
			for (const e of allEvents) {
				if (e.start < end && e.end > start && e.start <= t && e.end > t) {
					count++;
				}
			}
			if (count > maxOverlap) maxOverlap = count;
		}
		return maxOverlap;
	}

	/**
	 * Get CSS style for vertical placement and height of an event within its starting hour column.
	 *
	 * @param event - Event with start and end times in minutes since midnight
	 * @returns CSS style string positioning the event inside the hour slot
	 */
	function getEventStyle(event: CalendarWeekEvent) {
		const top = ((event.start % 60) / 60) * 100; // minutes -> percent within the hour
		const height = ((event.end - event.start) / 60) * 100;
		return `top:${top}%;height:${height}%;`;
	}

	// Helper to calculate adjusted month/day accounting for previous/next month
	function getDateInfo(baseMonthDay: number) {
		const isPrevMonth = baseMonthDay < 1;
		const isNextMonth = baseMonthDay > daysInCurrentMonth;
		const monthDay = isPrevMonth
			? daysInPreviousMonth + baseMonthDay
			: isNextMonth
				? baseMonthDay - daysInCurrentMonth
				: baseMonthDay;
		const month = isPrevMonth
			? currMonth === 0
				? 11
				: currMonth - 1
			: isNextMonth
				? currMonth === 11
					? 0
					: currMonth + 1
				: currMonth;
		const year = isPrevMonth
			? currMonth === 0
				? currYear - 1
				: currYear
			: isNextMonth
				? currMonth === 11
					? currYear + 1
					: currYear
				: currYear;
		return { monthDay, month, year };
	}
</script>

{#key currMonth + '' + currYear}
	<p class="h3 mb-10 print:mb-1" in:fly|local={{ duration: 250, y: -80 }}>
		<!-- todo: display both months if there are 2 shown, otherwise it's ambiguous -->
		{monthNames[currMonth]}
		{currYear}
	</p>
{/key}

<div class="grid grid-cols-8 w-[32rem] md:w-[40rem] xl:w-[48rem] 2xl:w-[64rem] mx-auto">
	<span></span>
	{#each weekdayNames as weekday}
		<span class="p-sm sm:p">{weekday}</span>
	{/each}

	<span></span>

	{#each Array(7) as _, day}
		{@const baseMonthDay = todayMonthday + day - todayWeekday}
		{@const { monthDay, month: dayMonth, year: dayYear } = getDateInfo(baseMonthDay)}

		{@const isToday =
			day === new Date().getDay() &&
			monthDay === new Date().getDate() &&
			dayMonth === new Date().getMonth() &&
			dayYear === new Date().getFullYear()}

		{@const allDayEvents = highlightedDays.filter(
			(e) =>
				e.month === dayMonth &&
				e.day === monthDay &&
				e.year === dayYear &&
				e.startTimeInMinutes === undefined
		)}

		{#key baseMonthDay}
			<div class="flex flex-col items-center">
				<button
					onclick={() => createCallback(monthDay, dayMonth, dayYear)}
					in:scale|local={{ duration: 250 }}
					class="size-10 sm:size-16 hover:bg-base-300 dark:hover:bg-base-600 mt-2 mb-4 print:my-0 rounded-full aspect-square w-fit flex items-center justify-center
		{isToday ? 'bg-accent-700 print:bg-[inherit]' : ''}">
					<span
						class="mx-auto h4 sm:h3 {isToday
							? 'text-base-50 sm:text-base-50 print:text-[inherit] sm:print:text-[inherit]'
							: ''}">
						{monthDay}
					</span>
				</button>
				<!-- All day events shown at the top -->
				{#each allDayEvents as event}
					<button
						onclick={() => editCallback(event.id)}
						class="bg-accent-700 hover:bg-accent-900 text-base-50 p-1 p-sm w-full truncate text-wrap"
						class:print:hidden={!showEventsWhenPrinting}>
						{event.title || $dictionary.labels['Untitled']}
					</button>
				{/each}
			</div>
		{/key}
	{/each}

	{#each times as time, hour}
		<span class="p-sm sm:p h-10 lg:h-16 print:h-[2.25rem]">{time}</span>
		{#each Array(7) as _, day}
			{@const baseMonthDay = todayMonthday + day - todayWeekday}
			{@const { monthDay, month: dayMonth, year: dayYear } = getDateInfo(baseMonthDay)}

			{@const eventsInHour = getEventsForHour(monthDay, dayMonth, dayYear, hour)}

			<div
				class="relative h-10 lg:h-16 print:h-[2.25rem] border-t border-l border-base-300 dark:border-base-600"
				class:border-r={day === 6}
				class:border-b={times.length - 1 === hour}>
				<!-- Background - click to create event this hour -->
				<button
					class="hover:bg-base-300 dark:hover:bg-base-600 w-full h-full"
					aria-label={$dictionary.calendarSettings['New event']}
					onclick={() => createCallback(monthDay, dayMonth, dayYear, hour * 60)}></button>
				<div>
					{#each eventsInHour.slice(0, 3) as event}
						{#if Math.floor(event.start / 60) === hour}
							<!-- Calculate at most how many events will ever overlap with this one  -->
							{@const overlappingEvents = getMaxOverlappingEvents(event, eventsInHour)}
							<!-- For a given event, get its index among overlapping events at its start hour -->
							{@const laneIdx = eventsInHour.findIndex((e) => e.id === event.id)}

							<!-- Compute width and left based on above variables -->
							{@const width = overlappingEvents === 1 ? 0.9 : overlappingEvents === 2 ? 0.6 : 0.3}
							{@const left = laneIdx === 0 ? 0 : laneIdx === 1 ? 0.3 : 0.6}
							<button
								onclick={() => editCallback(event.id)}
								class="absolute p-1 bg-accent-700 border border-accent-900 hover:bg-accent-900 text-base-50 p-sm truncate text-wrap z-10 flex text-left"
								class:print:hidden={!showEventsWhenPrinting}
								style="width:{width * 100}%;left:{left * 100}%;{getEventStyle(event)};"
								title={event.title || $dictionary.labels['Untitled']}>
								{event.title || $dictionary.labels['Untitled']}
							</button>
						{/if}
					{/each}

					<!-- Plus and number if more than 3 events this hour -->
					{#if eventsInHour.length > 3}
						<div
							class="absolute right-0 top-1/2 -translate-y-1/2 w-1/3 left-2/3 flex justify-center z-10
                                                                bg-base-100 dark:bg-base-800 p-1 p-sm border border-base-300 dark:border-base-600 leading-none"
							class:print:hidden={!showEventsWhenPrinting}>
							+{eventsInHour.length - 3}
						</div>
					{/if}
				</div>
			</div>
		{/each}
	{/each}
</div>
