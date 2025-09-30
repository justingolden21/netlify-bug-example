<script lang="ts">
	/**
	 * Calendar page component
	 *
	 * Renders Week, Month, Year, Year List calendars based on primary display
	 */

	import { page } from '$app/state';
	import { fly } from 'svelte/transition';

	import AnalogClock from '$lib/components/features/analog/AnalogClock.svelte';
	import CalendarMonth from '$lib/components/pages/calendar/CalendarMonth.svelte';
	import CalendarWeek from '$lib/components/pages/calendar/CalendarWeek.svelte';
	import CalendarYearList from '$lib/components/pages/calendar/CalendarYearList.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Time from '$lib/components/features/misc/Time.svelte';
	import { dictionary } from '$lib/stores/languageDictionary';
	import { settings } from '$lib/stores/settings';
	import { open } from '$lib/util/modal.svelte';
	import { openNewEvent } from '$lib/util/eventListActions';
	import { allThemes } from '$lib/stores/themes';
	import { defaultTheme } from '$lib/themes';
	import { getMonthViewEvents } from '$lib/util/eventManager';
	import shareApp from '$lib/util/shareApp';
	import validateInt from '$lib/util/validateInt';
	import getTranslatedTimefield from '$lib/util/getTranslatedTimefield';

	const mode = $derived($settings.calendar.displays.primary);
	const locale = $derived($settings.locale.language ?? 'en');

	const displayLabels = $derived({
		week: getTranslatedTimefield(locale, 'week', false, true),
		month: getTranslatedTimefield(locale, 'month', false, true),
		month_clock: $dictionary.clockSettings.clockFormats.month_clock,
		year: getTranslatedTimefield(locale, 'year', false, true),
		year_list: $dictionary.clockSettings.clockFormats.year_list
	});

	const eventsEnabled = $derived($settings.calendar.eventsEnabled);

	let currYear = $state(new Date().getFullYear());
	let currMonth = $state(new Date().getMonth());

	let calendarWeekComponent = $state() as CalendarWeek,
		calendarMonthComponent = $state() as CalendarMonth,
		calendarMonthComponentXl = $state() as CalendarMonth;

	function gotoToday() {
		if (mode === 'week') {
			calendarWeekComponent.gotoToday();
		} else if (mode === 'month') {
			calendarMonthComponent.gotoToday();
		} else if (mode === 'month_clock') {
			calendarMonthComponentXl.gotoToday();
			calendarMonthComponent.gotoToday();
		} else {
			currYear = new Date().getFullYear();
		}
	}
	function prev() {
		if (mode === 'week') {
			calendarWeekComponent.prev();
		} else if (mode === 'month') {
			calendarMonthComponent.prev();
		} else if (mode === 'month_clock') {
			calendarMonthComponentXl.prev();
			calendarMonthComponent.prev();
		} else {
			currYear--;
		}
	}
	function next() {
		if (mode === 'week') {
			calendarWeekComponent.next();
		} else if (mode === 'month') {
			calendarMonthComponent.next();
		} else if (mode === 'month_clock') {
			calendarMonthComponentXl.next();
			calendarMonthComponent.next();
		} else {
			currYear++;
		}
	}

	// Keyboard shortcuts
	function onWindowKeyDown(e: KeyboardEvent) {
		// Return logic copied from `KeyboardShortcuts.svelte` - TODO: move logic there and check what the current page path is?
		// Return if setting not enabled or if the active element is an input the user can type in
		if (
			!$settings.keyboardShortcuts ||
			['input', 'textarea', 'select'].includes(document.activeElement?.tagName.toLowerCase() ?? '')
		)
			return;

		if (e.key === 'ArrowLeft') prev();
		if (e.key === 'ArrowRight') next();
		if (e.key === 't') gotoToday();

		if (e.key === 'w') $settings.calendar.displays.primary = 'week';
		if (e.key === 'm') $settings.calendar.displays.primary = 'month';
		if (e.key === 'c') $settings.calendar.displays.primary = 'month_clock';
		if (e.key === 'y') $settings.calendar.displays.primary = 'year';
		if (e.key === 'l') $settings.calendar.displays.primary = 'year_list';
	}

	let currentTheme = $derived(
		$allThemes.find((theme) => theme.id == $settings['clock'].themeID) ??
			JSON.parse(JSON.stringify(defaultTheme))
	);

	function getHighlightedDays(month: number = currMonth) {
		if (!eventsEnabled) return [];
		return getMonthViewEvents($settings.calendar.events, currYear, month);
	}
</script>

<svelte:window onkeydown={onWindowKeyDown} />

{#if $settings.calendar.displays.secondary !== 'none'}
	<div
		transition:fly={{ y: -160, duration: 250 }}
		class="flex flex-col flex-wrap sm:flex-row items-center justify-between gap-4 print:hidden pb-6 mb-10 border-b-2 border-base-300 dark:border-base-600">
		<div class="inline-flex gap-4">
			<Button
				variant="outline"
				size="icon"
				animation="move-left"
				className="rounded-none"
				onclick={prev}
				title={$dictionary.labels['Previous']}
				icon="chevron_left"></Button>

			<Button
				variant="outline"
				size="icon"
				animation="zoom"
				className="rounded-none"
				onclick={gotoToday}
				title={$dictionary.sunriseSunsetSettings["Use today's date"]}
				icon="target"></Button>

			<Button
				variant="outline"
				size="icon"
				animation="move-right"
				className="rounded-none"
				onclick={next}
				title={$dictionary.labels['Next']}
				icon="chevron_right"></Button>
		</div>
		<select
			class="h4 !bg-transparent !text-[inherit] print:hidden border-2 border-transparent hover:border-base-300 dark:hover:border-base-600"
			bind:value={$settings.calendar.displays.primary}
			aria-label={$dictionary.stopwatchSettings['Display']}>
			{#each ['week', 'month', 'month_clock', 'year', 'year_list'] as const as mode, idx}
				<option class="bg-base-100 dark:bg-base-700 !text-[inherit]" value={mode}>
					{displayLabels[mode]} ({['W', 'M', 'C', 'Y', 'L'][idx]})
				</option>
			{/each}
		</select>
		{#if $settings.calendar.displays.secondary === 'full'}
			<div class="flex gap-4">
				<Button
					variant="outline"
					size="adaptive"
					icon="print"
					animation="move-down"
					onclick={() => window.print()}
					className="print:hidden"
					title={$dictionary.labels['Print']}>
					<span class="hidden lg:inline">{$dictionary.labels['Print']}</span>
				</Button>

				<!-- todo: share btn and url param for display mode and time period -->
				<Button
					variant="outline"
					size="adaptive"
					icon="share"
					animation="flip-rotate"
					onclick={() => shareApp($dictionary, page.url.pathname)}
					className="print:hidden"
					title={$dictionary.labels['Share']}>
					<span class="hidden lg:inline">{$dictionary.labels['Share']}</span>
				</Button>
			</div>
		{/if}
	</div>
{/if}

{#key mode}
	<div in:fly={{ y: -160, duration: 250, delay: 250 }} out:fly={{ duration: 250 }}>
		{#if mode === 'week'}
			<CalendarWeek
				bind:this={calendarWeekComponent}
				createCallback={(day, month, year, startTimeInMinutes) => {
					if (!eventsEnabled) return;
					openNewEvent($dictionary, $settings.calendar.events.length, {
						day,
						month,
						year,
						startTimeInMinutes
					});
				}}
				editCallback={(id) => {
					if (!eventsEnabled) return;
					open('edit-event-modal', { eventId: id });
				}} />
		{:else if mode === 'month'}
			<CalendarMonth
				mode="month"
				bind:this={calendarMonthComponent}
				bind:currYear
				bind:currMonth
				highlightedDays={getHighlightedDays()}
				createCallback={(day, month, year) => {
					if (!eventsEnabled) return;
					openNewEvent($dictionary, $settings.calendar.events.length, { day, month, year });
				}}
				editCallback={(id) => {
					if (!eventsEnabled) return;
					open('edit-event-modal', { eventId: id });
				}} />
		{:else if mode === 'month_clock'}
			<!-- TODO: i18n for this mode name -->
			<div class="mb-4 sm:mb-10">
				<Time mode="time" classes="block h1 mb-2" />
				<Time mode="date" classes="block h3" />
			</div>
			<div
				class="flex flex-col sm:flex-row md:flex-col lg:flex-row items-center justify-center gap-4 sm:gap-10">
				<div class="shrink-0">
					<div class="hidden xl:block">
						<CalendarMonth
							mode="month"
							bind:this={calendarMonthComponentXl}
							bind:currYear
							bind:currMonth
							highlightedDays={getHighlightedDays()}
							createCallback={(day, month, year) => {
								if (!eventsEnabled) return;
								openNewEvent($dictionary, $settings.calendar.events.length, {
									day,
									month,
									year
								});
							}}
							editCallback={(id) => {
								if (!eventsEnabled) return;
								open('edit-event-modal', { eventId: id });
							}} />
					</div>
					<div class="xl:hidden">
						<CalendarMonth
							mode="year"
							bind:this={calendarMonthComponent}
							navigationMode="month"
							bind:currYear
							bind:currMonth
							highlightedDays={getHighlightedDays()}
							createCallback={(day, month, year) => {
								if (!eventsEnabled) return;
								openNewEvent($dictionary, $settings.calendar.events.length, {
									day,
									month,
									year
								});
							}}
							editCallback={(id) => {
								if (!eventsEnabled) return;
								open('edit-event-modal', { eventId: id });
							}} />
					</div>
				</div>
				<div class="mx-auto sm:mx-0 sm:basis-64 xl:basis-96">
					<AnalogClock theme={currentTheme} />
				</div>
			</div>
		{:else if mode === 'year_list'}
			<CalendarYearList
				{currYear}
				editCallback={(id) => {
					if (!eventsEnabled) return;
					open('edit-event-modal', { eventId: id });
				}} />
		{:else if mode === 'year'}
			<input
				aria-label={getTranslatedTimefield(locale, 'year')}
				type="number"
				class="border-none !text-3xl text-center mb-6"
				min="-10000"
				max="10000"
				oninput={(event) => {
					event.preventDefault();
					const value = validateInt(event.currentTarget, new Date().getFullYear());
					currYear = value;
					event.currentTarget.value = String(value);
				}}
				value={currYear} />

			<div class="flex flex-wrap gap-4 justify-center">
				{#each Array(12) as _, month}
					<CalendarMonth
						mode="year"
						{currYear}
						currMonth={month}
						highlightedDays={getHighlightedDays(month)}
						createCallback={(day, month, year) => {
							if (!eventsEnabled) return;
							openNewEvent($dictionary, $settings.calendar.events.length, { day, month, year });
						}} />
				{/each}
			</div>
		{/if}
	</div>
{/key}

<!-- TODO: make this a tray like worldclock? -->
{#if eventsEnabled}
	<div class="flex justify-center flex-wrap gap-4 lg:gap-6">
		<Button
			className="mt-6 print:hidden"
			size="lg"
			variant="outline"
			icon="plus"
			animation="zoom"
			onclick={() => openNewEvent($dictionary, $settings.calendar.events.length)}>
			{$dictionary.calendarSettings['New event']}
		</Button>

		<Button
			className="mt-6 print:hidden"
			size="lg"
			variant="outline"
			icon="list"
			animation="zoom"
			onclick={() => open('events-list-modal')}>
			{$dictionary.calendarSettings['Events list']}
		</Button>
	</div>
{/if}
