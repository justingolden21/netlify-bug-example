<script lang="ts">
	import { fly } from 'svelte/transition';
	import type { BirthdayItem } from '$lib/components/pages/birthdays/Birthdays.svelte';
	import type { HighlightedDay } from '$lib/components/pages/calendar/CalendarMonth.svelte';
	import CalendarMonth from '$lib/components/pages/calendar/CalendarMonth.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { dictionary } from '$lib/stores/languageDictionary';
	import { settings } from '$lib/stores/settings';
	import { open } from '$lib/util/modal.svelte';

	// Highlighted days logic

	/**
	 * Converts an array of birthday items into an array of HighlightedDay objects.
	 * Consolidates overlapping birthdays and uses singular/plural forms based on the number of birthdays.
	 */
	function birthdaysToHighlightedDays(
		birthdays: BirthdayItem[],
		dictionary: Record<string, any>
	): HighlightedDay[] {
		const currentYear = new Date().getFullYear();
		return birthdays.map(({ date, name, id }) => {
			const [_, month, day] = date.split('-').map(Number);
			return {
				id,
				month: month - 1, // Convert to 0-based month
				day,
				year: currentYear,
				title: `${dictionary.birthdaysSettings['Birthday:']} ${name}`
			};
		});
	}

	const highlightedDays = $derived(
		birthdaysToHighlightedDays($settings.birthdays.birthdays, $dictionary)
	);

	// Month component controls

	let calendarMonthComponent = $state() as CalendarMonth;
</script>

<div
	class="flex flex-col gap-4 lg:gap-6 min-w-80 print:hidden
	{$settings.birthdays.displays.secondary === 'simple' ? 'lg:max-w-96 mx-auto' : ''}"
	transition:fly={{ y: -160, duration: 250 }}>
	<!-- Buttons above for prev, current, next month -->
	<!-- Copied from Calendar.svelte -->
	<div class="flex gap-4 mx-auto">
		<Button
			variant="outline"
			size="icon"
			animation="move-left"
			className="rounded-none"
			onclick={() => calendarMonthComponent.prev()}
			title={$dictionary.labels['Previous']}
			icon="chevron_left"></Button>

		<Button
			variant="outline"
			size="icon"
			animation="zoom"
			className="rounded-none"
			onclick={() => calendarMonthComponent.gotoToday()}
			title={$dictionary.sunriseSunsetSettings["Use today's date"]}
			icon="target"></Button>

		<Button
			variant="outline"
			size="icon"
			animation="move-right"
			className="rounded-none"
			onclick={() => calendarMonthComponent.next()}
			title={$dictionary.labels['Next']}
			icon="chevron_right"></Button>
	</div>

	<CalendarMonth
		mode={$settings.birthdays.displays.secondary === 'simple' ? 'year' : 'month'}
		createCallback={(day, month, year) => open('add-birthday-modal', { day, month, year })}
		navigationMode="month"
		{highlightedDays}
		bind:this={calendarMonthComponent} />
</div>
