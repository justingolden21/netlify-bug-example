<script module lang="ts">
	export type HighlightedDay = {
		// Unique ID corresponding to the ID of a resource it is tied to (birthday or event)
		// Necessary for editing events when clicking the popover
		id: string;
		month: number;
		day: number;
		year: number;
		title: string;
		startTimeInMinutes?: number; // Optional: start time in minutes since midnight (for use in calendar week)
		endTimeInMinutes?: number; // Optional: end time in minutes since midnight (for use in calendar week)
	};
</script>

<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Popover from '$lib/components/ui/Popover.svelte';
	import { dictionary } from '$lib/stores/languageDictionary';
	import { settings } from '$lib/stores/settings';
	import { getMonthNames, getWeekNames } from '$lib/util/getWeekMonthNames';
	import validateInt from '$lib/util/validateInt';
	import getTranslatedTimefield from '$lib/util/getTranslatedTimefield';

	// Init to today
	const date = new Date();

	interface Props {
		currYear?: number;
		currMonth?: number;
		mode?: 'year' | 'month';
		// Used for birthdays
		navigationMode?: 'year' | 'month';
		highlightedDays?: HighlightedDay[];
		createCallback?: (day: number, month: number, year: number) => void;
		editCallback?: null | ((id: string) => void);
	}

	let {
		currYear = $bindable(date.getFullYear()),
		currMonth = $bindable(date.getMonth()),
		mode = 'month',
		navigationMode = mode,
		highlightedDays = [],
		createCallback = () => {},
		editCallback = null
	}: Props = $props();

	// Note: weeks and months are 0 indexed
	const locale = $derived($settings.locale.datetime ?? 'en');
	const monthNames = $derived(getMonthNames(locale, 'long'));
	const weekdayNames = $derived(getWeekNames(locale, 'short'));
	const shortWeekdayNames = $derived(getWeekNames(locale, 'narrow'));
	const showEventsWhenPrinting = $derived($settings.calendar.showEventsWhenPrinting);

	// Get the day of the week of first day of these months - int
	// let dayOfWeekPreviousMonth = $derived(new Date(currYear, currMonth - 1, 1).getDay()); // first day of prev month, day of week
	const dayOfWeekCurrentMonth = $derived(new Date(currYear, currMonth, 1).getDay()); // first day of month, day of week
	const dayOfWeekNextMonth = $derived(new Date(currYear, currMonth + 1, 1).getDay()); // first day of next month, day of week

	// Get the number of days in each month - int
	const daysInPreviousMonth = $derived(new Date(currYear, currMonth, 0).getDate());
	const daysInCurrentMonth = $derived(new Date(currYear, currMonth + 1, 0).getDate()); // last day of month, number of last day
	// let daysInNextMonth = $derived(new Date(currYear, currMonth + 2, 0).getDate());

	function getDaysToDisplay() {
		// Add `month` and `year` for `createCallback` of prev/next months,
		// since other months/years may be displayed in this month (greyed out)
		// eg. user can be in April but greyed numbers from March and May are displayed
		// and in Jan or Dec then other years can be displayed

		const days = [];
		// Prev month
		for (let i = dayOfWeekCurrentMonth; i > 0; i--) {
			const prevMonth = (currMonth + 11) % 12;
			const year = prevMonth === 11 ? currYear - 1 : currYear;
			days.push({
				state: 'inactive',
				num: daysInPreviousMonth - i + 1,
				month: prevMonth,
				year: year
			});
		}
		// Current month
		for (let i = 1; i <= daysInCurrentMonth; i++) {
			const isToday =
				i === date.getDate() &&
				currMonth === new Date().getMonth() &&
				currYear === new Date().getFullYear();
			days.push({ state: isToday ? 'today' : 'active', num: i, month: currMonth, year: currYear });
		}
		// Next month
		for (let i = dayOfWeekNextMonth; days.length < 42; i++) {
			// Loop until 42 days (6 weeks) to avoid layout shift when changing months
			const nextMonth = (currMonth + 1) % 12;
			const year = nextMonth === 0 ? currYear + 1 : currYear;
			days.push({
				state: 'inactive',
				num: i - dayOfWeekNextMonth + 1,
				month: nextMonth,
				year: year
			});
		}
		return days;
	}

	const displayDays = $derived(
		currMonth !== undefined && currYear !== undefined ? getDaysToDisplay() : []
	);

	export function gotoToday() {
		const today = new Date();
		currYear = today.getFullYear();
		currMonth = today.getMonth();
	}

	export function prev() {
		if (mode === 'year' && navigationMode === 'year') {
			currYear--;
		} else {
			// Previous month
			currMonth--;
			if (currMonth < 0) {
				currMonth += 12;
				currYear--;
			}
		}
	}

	export function next() {
		if (mode === 'year' && navigationMode === 'year') {
			currYear++;
		} else {
			// Next month
			currMonth++;
			if (currMonth > 11) {
				currMonth -= 12;
				currYear++;
			}
		}
	}

	let monthSelectVal = $state(currMonth);
	$effect(() => {
		// Keep select box in sync with currMonth prop
		monthSelectVal = currMonth;
	});
</script>

<div
	class="surface {mode === 'year'
		? 'p-4'
		: 'pad print:w-full'} select-none inline-block print:break-inside-avoid">
	<div class="flex justify-between items-end gap-4 {mode === 'year' ? 'mb-2' : 'mb-6'}">
		{#if mode === 'year'}
			<p class="h4">
				{monthNames[currMonth]}
				<!-- if it's year mode but month navigation,
					it's a month being shown by itself in small view, so show year too -->
				{#if navigationMode === 'month'}
					{currYear}
				{/if}
			</p>
		{:else}
			<p>
				<select
					aria-label={getTranslatedTimefield(locale, 'month')}
					class="h4 print:h1 mr-2 !bg-transparent !text-[inherit]"
					bind:value={monthSelectVal}
					onchange={() => (currMonth = monthSelectVal)}>
					{#each monthNames as monthName, idx}
						<option class="bg-base-100 dark:bg-base-700" value={idx}>
							{monthName}
						</option>
					{/each}
				</select>

				<input
					aria-label={getTranslatedTimefield(locale, 'year')}
					type="number"
					class="print:!text-2xl print:!font-bold w-24 border-none"
					min="-10000"
					max="10000"
					oninput={(event) => {
						event.preventDefault();
						const value = validateInt(event.currentTarget, new Date().getFullYear());
						currYear = value;
						event.currentTarget.value = String(value);
					}}
					value={currYear} />
			</p>
		{/if}
	</div>

	<div class="grid grid-cols-7 {mode === 'year' ? 'gap-1' : 'gap-4'}">
		{#each mode === 'year' ? shortWeekdayNames : weekdayNames as weekday}
			<span class="text-center font-bold {mode === 'year' ? 'p-sm' : 'p'}">{weekday}</span>
		{/each}

		{#each displayDays as displayDay, idx (displayDay.num + '' + idx + '' + currMonth + '' + currYear)}
			{@const highlightedItems = highlightedDays.filter(
				(h) =>
					h.month === displayDay.month && h.day === displayDay.num && h.year === displayDay.year
			)}
			{@const isHighlighted = highlightedItems.length > 0}
			<Popover doPopover={isHighlighted}>
				{#snippet trigger()}
					<Button
						onclick={() => createCallback(displayDay.num, displayDay.month, displayDay.year)}
						size="icon"
						variant="ghost"
						className="mx-auto transition-none
						{mode === 'year' ? 'w-6 h-6 p' : 'w-10 h-10 print:w-16 print:h-16 p-lg print:h2'}
						{displayDay.state === 'inactive' ? 'opacity-50' : ''}
						{isHighlighted && displayDay.state === 'today' ? 'rounded' : ''}
						{isHighlighted && displayDay.state !== 'today' ? 'rounded-none' : ''}
						{isHighlighted || displayDay.state === 'today'
							? 'bg-accent-700 text-base-50 print:bg-[inherit] print:text-[inherit]'
							: ''}">
						{displayDay.num}
					</Button>
				{/snippet}
				{#snippet content()}
					<div>
						{#if highlightedItems.length > 0}
							{#each highlightedItems as h}
								<div
									class="flex items-center gap-1 mb-1"
									class:print:hidden={!showEventsWhenPrinting}>
									{h.title || $dictionary.labels['Untitled']}
									{#if editCallback}
										<Button
											variant="ghost"
											size="icon"
											icon="pencil"
											className="p-4 h-6 w-6"
											onclick={() => editCallback(h.id)}>
										</Button>
									{/if}
								</div>
							{/each}
						{/if}
					</div>
				{/snippet}
			</Popover>
		{/each}
	</div>
</div>
