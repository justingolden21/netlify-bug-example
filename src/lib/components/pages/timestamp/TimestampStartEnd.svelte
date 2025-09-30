<script lang="ts">
	/**
	 * Timestamp section that allows the user to calculate epoch times
	 */

	import { onMount } from 'svelte';

	import { dictionary } from '$lib/stores/languageDictionary';
	import { getDaysInMonth } from '$lib/util/timestamp';
	import { settings } from '$lib/stores/settings';
	import getTranslatedTimefield from '$lib/util/getTranslatedTimefield';

	let selectedOption: 'day' | 'month' | 'year' = $state('month');
	let year = $state(new Date().getFullYear());
	let month = $state(new Date().getMonth() + 1);
	let day = $state(new Date().getDate());
	let timezone: 'GMT' | 'local' = $state('GMT');
	const locale = $derived($settings.locale.language ?? 'en');

	let startTimestamp: number = $state(0);
	let endTimestamp: number = $state(0);
	let startDateGMT: string = $state('');
	let endDateGMT: string = $state('');

	let startDateLocal: string = $state('');
	let endDateLocal: string = $state('');

	function formatDateInTimeZone(date: Date, timeZone: string): string {
		return new Intl.DateTimeFormat('en-US', {
			timeZone,
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: 'numeric',
			minute: 'numeric',
			second: 'numeric',
			timeZoneName: 'short'
		}).format(date);
	}

	function calculateEpoch(yearIn: number, monthIn: number, dayIn: number) {
		// Validation for incoming params

		yearIn = Number(yearIn);
		monthIn = Number(monthIn);
		dayIn = Number(dayIn);

		if (isNaN(yearIn) || yearIn < 0 || yearIn > 9999) {
			yearIn = new Date().getFullYear();
		}
		if (isNaN(monthIn) || monthIn < 1 || monthIn > 12) {
			monthIn = 1;
		}
		if (isNaN(dayIn) || dayIn < 1 || dayIn > getDaysInMonth(yearIn, monthIn)) {
			dayIn = 1;
		}

		// Set values used to bind number inputs with the newly validated params
		// Above we reassign params, but we want to also reassign the values used to bind inputs
		year = yearIn;
		month = monthIn;
		day = dayIn;

		// Date setup

		const date = new Date(yearIn, monthIn - 1, selectedOption === 'day' ? dayIn : 1);

		const start = new Date(date);
		const end = new Date(date);

		if (selectedOption === 'day') {
			end.setDate(end.getDate() + 1);
		} else if (selectedOption === 'month') {
			start.setDate(1);
			end.setMonth(end.getMonth() + 1);
			end.setDate(0);
		} else if (selectedOption === 'year') {
			start.setMonth(0, 1);
			end.setFullYear(end.getFullYear() + 1);
			end.setMonth(0, 0);
		}

		// Set timestamp and dates

		const startOffset = timezone !== 'local' ? start.getTimezoneOffset() * 60 * 1000 : 0;
		const endOffset = timezone !== 'local' ? end.getTimezoneOffset() * 60 * 1000 : 0;

		startTimestamp = (start.getTime() - startOffset) / 1000;
		endTimestamp = (end.getTime() - endOffset) / 1000 + 24 * 60 * 60 - 1; // 1 second before day ends

		startDateGMT = formatDateInTimeZone(new Date(start.getTime() - startOffset), 'Etc/GMT');
		endDateGMT = formatDateInTimeZone(new Date(end.getTime() - endOffset), 'Etc/GMT');

		startDateLocal = formatDateInTimeZone(
			new Date(start.getTime() - startOffset),
			Intl.DateTimeFormat().resolvedOptions().timeZone
		);
		endDateLocal = formatDateInTimeZone(
			new Date(end.getTime() - endOffset),
			Intl.DateTimeFormat().resolvedOptions().timeZone
		);
	}

	onMount(() => calculateEpoch(year, month, day));

	// If day is invalid for month, then set it to max day
	$effect(() => {
		if (day > getDaysInMonth(year, month)) {
			day = getDaysInMonth(year, month);
		}
	});
	$effect(() => {
		if (selectedOption) calculateEpoch(year, month, day);
	});
</script>

<h2 class="h2 mb-2">
	{$dictionary.timestampSettings.sectionTitles['Day, Month, Year Start/End']}
</h2>

<h2 class="text-sm mb-2">{$dictionary.timestampSettings.startEnd.epochNotice}</h2>

<hr class="my-4" />

<div class="flex gap-4 mb-2">
	{$dictionary.timestampSettings.startEnd['Show start and end of']}
	<label class="radio-label">
		<input type="radio" name="period" value="year" bind:group={selectedOption} />
		{getTranslatedTimefield(locale, 'year', false, true)}
	</label>
	<label class="radio-label">
		<input type="radio" name="period" value="month" bind:group={selectedOption} />
		{getTranslatedTimefield(locale, 'month', false, true)}
	</label>
	<label class="radio-label">
		<input type="radio" name="period" value="day" bind:group={selectedOption} />
		{getTranslatedTimefield(locale, 'day', false, true)}
	</label>
</div>

<!-- todo: maybe in the future, add option to enter timestamp or use date input here -->
<div class="grid grid-cols-2 sm:grid-cols-4 items-center gap-4">
	<label class="label">
		<p>{getTranslatedTimefield(locale, 'year', false, true)}</p>
		<input type="number" min="0" max="9999" bind:value={year} />
	</label>
	<label class="label">
		<p>{getTranslatedTimefield(locale, 'month', false, true)}</p>
		<input type="number" min="1" max="12" bind:value={month} disabled={selectedOption === 'year'} />
	</label>
	<label class="label">
		<p>{getTranslatedTimefield(locale, 'day', false, true)}</p>
		<input
			type="number"
			min="1"
			max={getDaysInMonth(year, month)}
			bind:value={day}
			disabled={selectedOption !== 'day'} />
	</label>
	<label class="label">
		<p>{$dictionary.labels['Timezone:']}</p>
		<select bind:value={timezone}>
			<option value="GMT">{$dictionary.labels['GMT']}</option>
			<option value="local">{$dictionary.labels['Local']}</option>
		</select>
	</label>
</div>

<h3 class="h4 mt-6 mb-4">
	{$dictionary.timestampSettings.startEnd['Start / End']}
</h3>

<div class="overflow-x-auto">
	<table class="w-full divide-y divide-base-300 dark:divide-base-600">
		<thead>
			<tr>
				<th>{$dictionary.timestampSettings.startEnd['Start / End']}</th>
				<th>{$dictionary.timestampSettings.startEnd['Timestamp (seconds)']}</th>
				<th>{$dictionary.timestampSettings.startEnd['Timestamp (milliseconds)']}</th>
				<th>{$dictionary.timestampSettings.startEnd['Date in GMT']}</th>
				<th>{$dictionary.timestampSettings.startEnd['Date in Local Time']}</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<td>
					{getTranslatedTimefield(locale, selectedOption, false, true)}
					{$dictionary.timestampSettings.startEnd['Start']}
				</td>
				<td>{startTimestamp} </td>
				<td>{startTimestamp * 1000} </td>
				<td>{startDateGMT}</td>
				<td>{startDateLocal}</td>
			</tr>
			<tr>
				<td>
					{getTranslatedTimefield(locale, selectedOption, false, true)}
					{$dictionary.timestampSettings.startEnd['End']}
				</td>
				<td>{endTimestamp}</td>
				<td>{endTimestamp * 1000 + 999}</td>
				<td>{endDateGMT}</td>
				<td>{endDateLocal}</td>
			</tr>
		</tbody>
	</table>
</div>

<style lang="postcss">
	td {
		@apply whitespace-nowrap py-4;
	}
	th {
		text-align: left;
	}
	.radio-label {
		@apply flex items-center gap-1;
	}
	input[type='radio'] {
		@apply h-4 w-4 accent-accent-700;
	}
	input[type='number'] {
		width: 100%;
		max-width: 6rem;
	}
</style>
