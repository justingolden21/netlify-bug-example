<script lang="ts">
	// Birthdays are considered as year, month, and day in GMT, without accounting for timezones.
	// Today's date is evaluated based on the year, month, and day in the current timezone.
	// For example, if someone was born on Jan 1, it is celebrated as Jan 1 in all timezones.
	// However, if today's date is Feb 1 in the current timezone but another date in other timezones, we celebrate birthdays on Feb 1

	// Birthdays on leap day (February 29) are adjusted to March 1 in non-leap years.
	// This is done by vanilla JS for us, for instance, `new Date('2025-02-29')` is equivalent to `2025-03-01` GMT.

	import { flip } from 'svelte/animate';
	import { fade, scale } from 'svelte/transition';
	import dayjs from 'dayjs';

	import VectorArt from '$lib/components/features/misc/VectorArt.svelte';
	import type { BirthdayItem } from '$lib/components/pages/birthdays/Birthdays.svelte';
	import BirthdaysConfetti from '$lib/components/pages/birthdays/BirthdaysConfetti.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { dictionary } from '$lib/stores/languageDictionary';
	import { settings } from '$lib/stores/settings';
	import getFormat from '$lib/util/getFormat';
	import { open } from '$lib/util/modal.svelte';
	import { getDateTime } from '$lib/util/timeText';

	// Birthday utility functions

	// Birthday is treated as GMT and timezone is set to GMT so it displays the correct day
	function formatDate(dateStr: string, upcomingYear = false) {
		return getDateTime(
			parseDateAsGMT(dateStr, upcomingYear),
			getFormat('clock', 'date'),
			undefined,
			'Etc/GMT'
		);
	}

	// Years less than 3 digits are treated as 4 digits (year + 2000)... I don't care
	function parseDateAsGMT(dateString: string, upcomingYear = false): Date {
		const [year, month, day] = dateString.split('-').map(Number);

		const dateHasPassed = (month: number, day: number) => {
			const now = new Date();

			// Create a date object with given month and day in current year
			const givenDate = new Date(now.getFullYear(), month - 1, day); // Months are 0-based in JS

			// Compare the given date with the current date
			return givenDate < now;
		};
		const birthdayUpcomingYear = new Date().getFullYear() + (dateHasPassed(month, day) ? 1 : 0);

		return new Date(Date.UTC(upcomingYear ? birthdayUpcomingYear : year, month - 1, day)); // Months are 0-based in JS
	}

	function getAgeTurning(birthdateString: string): number {
		const birthdate = parseDateAsGMT(birthdateString);
		const today = new Date();

		let age = today.getFullYear() - birthdate.getUTCFullYear();

		// Create a birthday date for the current year in local time
		const birthdayThisYear = new Date(
			today.getFullYear(),
			birthdate.getUTCMonth(),
			birthdate.getUTCDate()
		);

		// Adjust the age if the birthday hasn't occurred yet this year
		if (today < birthdayThisYear) {
			age--;
		}

		// The age they will turn during their next birthday, add 1
		return age + 1;
	}

	function getDaysUntilBirthday(birthdateString: string): number {
		const birthdate = parseDateAsGMT(birthdateString);
		const today = new Date();

		// Calculate the birthday date for the current year in local time

		const birthdayThisYear = new Date(
			today.getFullYear(),
			birthdate.getUTCMonth(),
			birthdate.getUTCDate()
		);

		let daysUntilBirthday = Math.ceil(
			(birthdayThisYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
		);

		// If the birthday is in the past for this year, calculate for the next year
		if (daysUntilBirthday < 0) {
			const nextYearBirthday = new Date(
				today.getFullYear() + 1,
				birthdate.getUTCMonth(),
				birthdate.getUTCDate()
			);
			daysUntilBirthday = Math.ceil(
				(nextYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
			);
		}

		return daysUntilBirthday;
	}

	function deleteBirthday(id: string) {
		$settings.birthdays.birthdays = $settings.birthdays.birthdays.filter((b) => b.id !== id);
	}

	// Filter, sort, and group birthdays to be rendered in the birthdays list

	let searchTerm = $state('');

	function nameSearch(birthdays: BirthdayItem[], searchTerm: string): BirthdayItem[] {
		// Show all search results if searchbar hidden
		if (searchTerm === '' || !$settings.birthdays.displays.showSearchbar) {
			return birthdays;
		}
		searchTerm = searchTerm.toLowerCase().trim();
		return birthdays.filter((b) => b.name.toLowerCase().startsWith(searchTerm));
	}

	// Necessary for displaying month titles above birthdays
	function groupByMonth(birthdays: BirthdayItem[], startAtCurrentMonth: boolean) {
		const currentMonth = startAtCurrentMonth ? new Date().getMonth() : 0;
		const grouped: { [key: number]: BirthdayItem[] } = {};

		birthdays.forEach((birthday) => {
			let month = parseDateAsGMT(birthday.date).getUTCMonth();
			if (startAtCurrentMonth) {
				month = (month - currentMonth + 12) % 12; // Adjust month based on current month
			}
			if (!grouped[month]) {
				grouped[month] = [];
			}
			grouped[month].push(birthday);
		});

		return Object.entries(grouped)
			.map(([month, birthdays]) => ({
				month: Number(month) + (startAtCurrentMonth ? currentMonth : 0), // Revert the adjustment for display
				birthdays
			}))
			.sort((a, b) => a.month - b.month); // Ensure months are in correct order
	}

	function sortBirthdays(birthdays: BirthdayItem[]): BirthdayItem[] {
		return [...birthdays].sort(
			(a, b) => parseDateAsGMT(a.date).getTime() - parseDateAsGMT(b.date).getTime()
		);
	}

	const filteredBirthdays = $derived(nameSearch($settings.birthdays.birthdays, searchTerm));
	const sortedBirthdays = $derived(sortBirthdays(filteredBirthdays));
	const groupedBirthdays = $derived(
		groupByMonth(sortedBirthdays, $settings.birthdays.displays.startAtCurrentMonth)
	);

	// This is used a lot so use this alias for readability
	const simplerBirthdayItems = $derived($settings.birthdays.displays.primary === 'simple');

	// Display localized month name for month headings
	function formatMonth(month: number, locale: string): string {
		return dayjs().month(month).locale(locale).format('MMMM');
	}

	// Formats a message about how many days until a birthday with values interpolated into it
	const formatMessage = (template: string, ...values: number[]): string =>
		values.reduce(
			(result: string, value, index) =>
				result.replace(`{${index + 1}}`, `<span class="font-bold text-xl">${String(value)}</span>`),
			template
		);

	const anyBirthdaysToday = $derived(
		$settings.birthdays.birthdays.some((b) => getDaysUntilBirthday(b.date) === 0)
	);
</script>

{#if $settings.birthdays.displays.showConfetti && anyBirthdaysToday}
	<BirthdaysConfetti />
{/if}

{#if $settings.birthdays.displays.showSearchbar && $settings.birthdays.birthdays.length > 0}
	<input
		bind:value={searchTerm}
		type="text"
		class="w-full sm:p-4 !text-xl xl:sticky xl:top-0 xl:z-10 mb-10 print:hidden" />
{/if}

<!-- Always `gap-6` instead of `gap-4 lg:gap-6` to allow space above floating trash btn -->
<div class="w-full flex flex-col print:gap-0 {simplerBirthdayItems ? 'gap-2' : 'gap-6'}">
	{#each groupedBirthdays as { month, birthdays }}
		{#if $settings.birthdays.displays.showMonthHeadings}
			<h3
				class="h4 mt-6 first:mt-0 bg-accent-700 text-white p-2"
				transition:fade|local={{ duration: 125 }}>
				{formatMonth(month, $settings.locale.language ?? 'en')}
			</h3>
		{/if}
		{#each birthdays as birthday (birthday.id)}
			{@const highlightBirthday =
				$settings.birthdays.displays.highlightCloseBirthdays &&
				getDaysUntilBirthday(birthday.date) <=
					$settings.birthdays.displays.highlightCloseBirthdaysDays}
			<div
				class="{simplerBirthdayItems
					? 'p-1 rounded flex gap-4 lg:gap-6 justify-between'
					: 'surface p-4'} relative print:p-2 print:border-t-0 print:first:border-t-2 print:break-inside-avoid
					
					{highlightBirthday
					? 'border-accent-700 bg-accent-700 text-base-50 dark:border-accent-700 dark:bg-accent-700 dark:text-base-50'
					: ''}
					"
				animate:flip={{ duration: 250 }}
				in:scale|local={{ duration: 250 }}
				out:fade|local={{ duration: 125 }}>
				{#if simplerBirthdayItems}
					<p class="font-bold text-xl">{birthday.name}</p>

					<p class="font-bold text-xl">{formatDate(birthday.date, true)}</p>
					{#if getDaysUntilBirthday(birthday.date) === 0}
						<Icon
							name="birthdays"
							size="unset"
							className="h-10 {$settings.birthdays.displays.highlightCloseBirthdays
								? 'text-white'
								: 'text-accent-700/50 dark:text-accent-300/50'} absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none print:hidden" />
					{/if}
				{:else}
					<!-- todo future: convert to three dots menu and have delete, edit, and share -->
					<!-- if we add three dots in future, change above gap-6 to gap-4 lg:gap-6 for consistency with rest of UI -->
					<div
						class="flex gap-4 lg:gap-6 items-center justify-between flex-wrap flex-col sm:flex-row">
						<Button
							size="icon"
							className="absolute -top-4 -right-4 sm:right-2 sm:order-2 print:hidden"
							icon="trash"
							onclick={() => deleteBirthday(birthday.id)}></Button>
						<p class="h2 mb-2 {highlightBirthday ? 'text-base-50' : ''}">{birthday.name}</p>
					</div>

					<div
						class="flex gap-4 lg:gap-6 items-center justify-between flex-wrap flex-col sm:flex-row">
						<div class="text-center sm:text-left">
							<p class="font-bold text-xl">{formatDate(birthday.date, true)}</p>
						</div>
						<p class="print:hidden">
							{#if getDaysUntilBirthday(birthday.date) !== 0}
								{@html formatMessage(
									$dictionary.birthdaysSettings.turningInDays,
									getAgeTurning(birthday.date),
									getDaysUntilBirthday(birthday.date)
								)}
							{:else}
								{@html formatMessage(
									$dictionary.birthdaysSettings.turningToday,
									getAgeTurning(birthday.date)
								)}
							{/if}
						</p>
						{#if getDaysUntilBirthday(birthday.date) === 0}
							<Icon
								name="birthdays"
								size="unset"
								className="h-24 {$settings.birthdays.displays.highlightCloseBirthdays
									? 'text-white'
									: 'text-accent-700/50 dark:text-accent-300/50'} absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
						{/if}
					</div>
				{/if}
			</div>
		{/each}
	{/each}

	{#if groupedBirthdays.length === 0}
		<div class="select-none w-80 xl:w-96 mx-auto mb-10">
			<VectorArt name="balloons" />
		</div>
		<p class="p-lg text-center {simplerBirthdayItems ? 'mt-4 lg:mt-6' : ''}">
			{#if $settings.birthdays.birthdays.length === 0}
				{$dictionary.birthdaysSettings['You have no birthdays. Click below to add one.']}
			{:else}
				{$dictionary.messages['No results found.']}
			{/if}
		</p>
	{/if}

	<Button
		icon="plus"
		animation="zoom"
		onclick={() => open('add-birthday-modal')}
		className="print:hidden {simplerBirthdayItems ? 'mt-4 lg:mt-6' : ''}">
		{$dictionary.birthdaysSettings['Add birthday']}
	</Button>

	{#if groupedBirthdays.length !== 0}
		<Button
			icon="print"
			animation="zoom"
			onclick={() => window.print()}
			className="print:hidden {simplerBirthdayItems ? 'mt-4 lg:mt-6' : ''}">
			{$dictionary.labels['Print']}
		</Button>
	{/if}
</div>

<style lang="postcss">
	/* Search */
	input[type='text'] {
		background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21 21-5-5a7.5 7.5 0 10-10-10 7.5 7.5 0 0010 10"></path></svg>');
		background-repeat: no-repeat;
		background-position: right 0.5rem center;
		background-size: 1.5rem;
	}

	:global(.dark) input[type='text'] {
		background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21 21-5-5a7.5 7.5 0 10-10-10 7.5 7.5 0 0010 10"></path></svg>');
	}
</style>
