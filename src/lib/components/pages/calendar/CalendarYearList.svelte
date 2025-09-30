<script lang="ts">
	import { dictionary } from '$lib/stores/languageDictionary';
	import { settings } from '$lib/stores/settings';
	import { getMonthNames, getWeekNames } from '$lib/util/getWeekMonthNames';
	import { getEventsAsHighlightedDays } from '$lib/util/eventManager';
	import validateInt from '$lib/util/validateInt';

	const locale = $derived($settings.locale.datetime ?? 'en');
	const monthNames = $derived(getMonthNames(locale, 'long'));
	const weekdayNames = $derived(getWeekNames(locale, 'short'));

	// Init to today
	const date = new Date();
	interface Props {
		currYear?: number;
		editCallback?: (id: string) => void;
	}

	let { currYear = $bindable(date.getFullYear()), editCallback = () => {} }: Props = $props();
	const eventsEnabled = $derived($settings.calendar.eventsEnabled);
	const showEventsWhenPrinting = $derived($settings.calendar.showEventsWhenPrinting);

	let numCols = $state(1);
	const colsClass = $derived(
		numCols === 2
			? 'sm:grid-cols-2'
			: numCols === 3
				? 'sm:grid-cols-3'
				: numCols === 4
					? 'sm:grid-cols-4'
					: ''
	);

	function isSameCalendarDay(date1: Date, date2: Date) {
		return (
			date1.getDate() === date2.getDate() &&
			date1.getMonth() === date2.getMonth() &&
			date1.getFullYear() === date2.getFullYear()
		);
	}
</script>

<div class="hidden sm:block print:hidden print:sm:hidden mb-10 mx-auto">
	<select class="h4 !bg-transparent !text-[inherit]" bind:value={numCols}>
		{#each [1, 2, 3, 4] as option}
			<option class="bg-base-100 dark:bg-base-700 !text-[inherit]" value={option}>
				{option}
			</option>
		{/each}
	</select>
	<p class="p">{$dictionary.calendarSettings['columns']}</p>
</div>

<input
	type="number"
	class="!text-3xl text-center mb-6 border-none"
	min="-10000"
	max="10000"
	oninput={(event) => {
		event.preventDefault();
		const value = validateInt(event.currentTarget, 0);
		currYear = value;
		event.currentTarget.value = String(value);
	}}
	value={currYear} />

<div class="grid gap-10 {colsClass}">
	{#each Array(12) as _, month}
		{@const monthEvents = (() => {
			if (!eventsEnabled) return [];
			return getEventsAsHighlightedDays($settings.calendar.events, currYear, month);
		})()}
		<div>
			<p class="h4 mt-6 mb-2 text-left">
				{monthNames[month]}
			</p>
			<div class="flex flex-col gap-4">
				{#each Array(31) as _, day}
					{@const loopDate = new Date(currYear, month, day + 1)}
					<!-- if date is valid (has this many days) -->
					{#if loopDate.getMonth() === month}
						{@const events = monthEvents.filter((e) => e.day === loopDate.getDate())}
						<div class="flex border-b border-base-300 dark:border-base-600">
							<p
								class="{isSameCalendarDay(loopDate, new Date())
									? 'bg-accent-700 text-base-50 print:bg-[inherit] print:text-[inherit]'
									: ''} p w-24 text-left border border-b-0 border-base-300 dark:border-base-600 p-1">
								{loopDate.getDate()}
								{#if loopDate.getDate() < 10}
									&nbsp;
								{/if}
								{weekdayNames[loopDate.getDay()]}
							</p>
							<div class="flex-1 flex flex-col gap-1">
								{#each events as event}
									<button
										onclick={() => editCallback(event.id)}
										class="bg-accent-700 hover:bg-accent-900 text-base-50 p-1 p-sm w-full truncate text-wrap"
										class:print:hidden={!showEventsWhenPrinting}>
										{event.title || $dictionary.labels['Untitled']}
									</button>
								{/each}
							</div>
						</div>
					{/if}
				{/each}
			</div>
		</div>
	{/each}
</div>
