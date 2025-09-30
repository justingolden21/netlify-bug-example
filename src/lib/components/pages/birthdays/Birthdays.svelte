<script module lang="ts">
	/**
	 * Birthdays page component
	 *
	 * Contains `BirthdaysList` and `BirthdaysMonthView`
	 */

	export type BirthdayItem = {
		name: string;
		date: string;
		id: string;
	};
</script>

<script lang="ts">
	// todo future: reminder/notification options (notify day of checkbox, x days before checkbox)
	// todo future: confirm prompt for delete birthday / delete all birthdays
	// todo future: select specific birthdays to export/import

	import BirthdaysMonthView from '$lib/components/pages/birthdays/BirthdaysMonthView.svelte';
	import BirthdaysList from '$lib/components/pages/birthdays/BirthdaysList.svelte';
	import Tabs, { type Tab } from '$lib/components/ui/Tabs.svelte';
	import { dictionary } from '$lib/stores/languageDictionary';
	import { settings } from '$lib/stores/settings';

	const tabData = $derived([
		{
			name: $dictionary.birthdaysSettings['Birthdays List'],
			content: BirthdaysList,
			icon: 'list'
		},
		{
			name: $dictionary.birthdaysSettings['Calendar View'],
			content: BirthdaysMonthView,
			icon: 'calendar'
		}
	] as Tab[]);
</script>

<div class="sm:hidden">
	<Tabs tabs={tabData} spaceBelow />
</div>

<div class="hidden sm:grid gap-10 xl:grid-cols-2 xl:gap-6 xl:h-full">
	{#if !$settings.screenshotMode}
		<BirthdaysMonthView />
	{/if}

	<div class="w-full xl:overflow-y-auto">
		<BirthdaysList />
	</div>
</div>
