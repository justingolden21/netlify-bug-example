<script lang="ts">
	/**
	 * Displays an interface for user to enter a timestamp or date and time
	 *
	 * Child of `TimestampConvert`
	 */

	import Button from '$lib/components/ui/Button.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import Tabs, { type Tab } from '$lib/components/ui/Tabs.svelte';
	import { dictionary } from '$lib/stores/languageDictionary';
	import { dateToTimestamp, getDaysInMonth } from '$lib/util/timestamp';
	import validateInt from '$lib/util/validateInt';
	import { settings } from '$lib/stores/settings';
	import getTranslatedTimefield from '$lib/util/getTranslatedTimefield';

	// Source of truth - bind to this from parent

	interface Props {
		updateSelectedTimestamp: (timestamp: number) => void;
		isValid?: boolean;
	}

	let { updateSelectedTimestamp, isValid = $bindable(true) }: Props = $props();

	// UI state

	let dateTimeInputType: 'dateTime' | 'dateText' | 'individual' = $state('dateTime');
	let timestampMode: 'seconds' | 'milliseconds' = $state('milliseconds');
	let timezone: 'GMT' | 'local' = $state('local');

	// Tabs

	let currentTab: 'timestampToDate' | 'dateToTimestamp' = $state('timestampToDate');

	const tabData = $derived([
		{
			name: $dictionary.timestampSettings.convert['Timestamp to Date'],
			onclick: () => (currentTab = 'timestampToDate')
		},
		{
			name: $dictionary.timestampSettings.convert['Date to Timestamp'],
			onclick: () => (currentTab = 'dateToTimestamp')
		}
	] as Tab[]);

	// Inputs

	let timestamp: number = $state(Date.now()); // ms
	let dateString: string = $state('');
	let dateInput: string = $state('');
	let timeInput: string = $state('');
	let year: number = $state(0);
	let month: number = $state(1);
	let day: number = $state(1);
	let hour: number = $state(0);
	let minute: number = $state(0);
	let second: number = $state(0);
	const locale = $derived($settings.locale.language ?? 'en');

	// Display

	// Sets all inputs to current date and time
	// taking the timezone into account for relevant inputs
	function setToCurrent() {
		// similar to `setCurrentDatetime` in `TimeDifference.svelte`
		// in that we need to interpret which timezone we get date string and time string for
		const now = new Date();

		timestamp = timestampMode === 'seconds' ? Math.floor(now.getTime() / 1000) : now.getTime();
		dateString = now.toISOString();
		if (timezone === 'GMT') {
			// Convert to GMT by using UTC-based methods
			dateInput = now.toISOString().split('T')[0]; // YYYY-MM-DD
			timeInput = now.toISOString().split('T')[1].split('.')[0]; // HH:mm:ss
			year = now.getUTCFullYear();
			month = now.getUTCMonth() + 1; // Months are zero-based
			day = now.getUTCDate();
			hour = now.getUTCHours();
			minute = now.getUTCMinutes();
			second = now.getUTCSeconds();
		} else {
			// Use local time
			dateInput = now.toLocaleDateString('en-CA'); // 'en-CA' format is YYYY-MM-DD
			timeInput = now.toTimeString().split(' ')[0]; // HH:mm:ss
			year = now.getFullYear();
			month = now.getMonth() + 1; // Months are zero-based
			day = now.getDate();
			hour = now.getHours();
			minute = now.getMinutes();
			second = now.getSeconds();
		}
	}

	setToCurrent();

	// Update timestamp input when format changes between s and ms

	function timestampFormatChange() {
		if (timestampMode === 'seconds') timestamp = Math.round(timestamp / 1000);
		else timestamp = timestamp * 1000;
	}

	// TODO: this is dupe from `TimeDifference.svelte`
	// Returns true if is a number and not NaN
	// Ex. 3, 0, -2.5, Infinity return true
	// Ex. '33', 'hello', true, false, NaN, null, undefined return false
	function isValidNum(maybeNum: any) {
		return typeof maybeNum === 'number' && !isNaN(maybeNum);
	}

	// Update `selectedTimestamp` reactively
	$effect(() => {
		const selectedTimestamp = convertToTimestamp(
			dateTimeInputType,
			timestamp,
			timestampMode,
			timezone,
			currentTab,
			dateString,
			dateInput,
			timeInput,
			year,
			month,
			day,
			hour,
			minute,
			second
		);
		updateSelectedTimestamp(selectedTimestamp);
	});

	function convertToTimestamp(
		dateTimeInputType: 'dateTime' | 'dateText' | 'individual',
		timestamp: number,
		timestampMode: 'seconds' | 'milliseconds',
		timezone: 'GMT' | 'local',
		currentTab: 'timestampToDate' | 'dateToTimestamp',
		dateString: string,
		dateInput: string,
		timeInput: string,
		year: number,
		month: number,
		day: number,
		hour: number,
		minute: number,
		second: number
	): number {
		if (currentTab === 'timestampToDate') {
			isValid = isValidNum(timestamp) && !isNaN(new Date(timestamp).getTime());
			if (!isValid) return 0;
			return timestampMode === 'seconds' ? timestamp * 1000 : timestamp;
		}
		if (dateTimeInputType === 'dateText') {
			isValid = !isNaN(dateToTimestamp(dateString));
			if (!isValid) return 0;
			return dateToTimestamp(dateString);
		}
		if (dateTimeInputType === 'dateTime') {
			isValid = !isNaN(
				dateToTimestamp(`${dateInput}T${timeInput}${timezone === 'GMT' ? 'Z' : ''}`)
			);
			if (!isValid) return 0;
			return dateToTimestamp(`${dateInput}T${timeInput}${timezone === 'GMT' ? 'Z' : ''}`);
		}
		if (dateTimeInputType === 'individual') {
			let constructedDate = new Date(
				Number(year),
				Number(month) - 1, // Month is 0-indexed
				Number(day),
				Number(hour),
				Number(minute),
				Number(second)
			);

			isValid = !isNaN(constructedDate.getTime());
			if (!isValid) return 0;

			// Implement timezone
			// ISO string provides us with date in format: '1970-01-01T00:00:00.000Z'
			// We remove 'Z' if we want local time and not GMT
			if (timezone !== 'GMT') {
				constructedDate = new Date(constructedDate.toISOString().slice(0, -1));
			}

			return constructedDate.getTime();
		}
		// Should be unreachable but makes typescript happy
		return 0;
	}

	// If day is invalid for month, then set it to max day
	$effect(() => {
		if (day > getDaysInMonth(year, month)) {
			day = getDaysInMonth(year, month);
		}
	});
</script>

<h2 class="h2 mb-6">{$dictionary.timestampSettings.convert['Convert']}</h2>

<h3 class="h3 mb-4 sm:mb-6 lg:mb-10">
	<Icon name="input" />
	{$dictionary.timestampSettings.convert['Select Date and Time']}
</h3>

<Tabs tabs={tabData} />

{#if currentTab === 'timestampToDate'}
	<p class="h4 my-6">
		{$dictionary.timestampSettings.convert['Convert a timestamp to a human readable date']}
	</p>

	<div class="grid grid-cols-2 xl:grid-cols-4 justify-start gap-4 lg:gap-6">
		<label for="timestamp" class="label"
			>{$dictionary.timestampSettings.convert['Timestamp:']}</label>
		<input
			id="timestamp"
			type="number"
			min="0"
			max="999999999999999"
			oninput={(event) => {
				event.preventDefault();
				const value = validateInt(event.currentTarget);
				timestamp = value;
				event.currentTarget.value = String(value);
			}}
			value={timestamp} />
		<select
			class="col-span-full"
			aria-label={$dictionary.labels['Units']}
			bind:value={timestampMode}
			onchange={timestampFormatChange}>
			<option value="seconds">{getTranslatedTimefield(locale, 'second', true, true)}</option>
			<option value="milliseconds">
				{getTranslatedTimefield(locale, 'millisecond', true, true)}
			</option>
		</select>

		<Button icon="target" className="col-span-full" onclick={setToCurrent}>
			{$dictionary.sunriseSunsetSettings["Use today's date"]}
		</Button>
	</div>
{:else}
	<p class="h4 my-6">
		{$dictionary.timestampSettings.convert['Convert a time and date to timestamp']}
	</p>

	<div class="grid grid-cols-2 xl:grid-cols-4 justify-start gap-4 lg:gap-6">
		<label for="date-time-input-select">{$dictionary.labels['Input type:']}</label>
		<select id="date-time-input-select" bind:value={dateTimeInputType}>
			<option value="dateTime">{$dictionary.timestampSettings.convert['Date and Time']}</option>
			<option value="dateText">{$dictionary.timestampSettings.convert['Date Text']}</option>
			<option value="individual"
				>{$dictionary.timestampSettings.convert['Year, Month, Day, Hour, Min, Sec']}</option>
		</select>

		{#if dateTimeInputType === 'dateTime'}
			<label for="time-input" class="label">{$dictionary.labels['Time:']}</label>
			<input type="time" id="time-input" bind:value={timeInput} />

			<label for="date-input" class="label">{$dictionary.labels['Date:']}</label>
			<input type="date" id="date-input" bind:value={dateInput} />
		{:else if dateTimeInputType === 'dateText'}
			<label for="dateString">{$dictionary.timestampSettings.convert['Date Text']}</label>
			<input type="text" id="dateString" bind:value={dateString} class="mt-1 w-full" />
		{:else}
			<div class="col-span-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
				<div class="mb-4">
					<label for="year">{getTranslatedTimefield(locale, 'year', false, true)}</label>
					<input type="number" id="year" min="0" max="9999" bind:value={year} class="mt-1 w-full" />
				</div>
				<div class="mb-4">
					<label for="month">{getTranslatedTimefield(locale, 'month', false, true)}</label>
					<input type="number" id="month" min="1" max="12" bind:value={month} class="mt-1 w-full" />
				</div>
				<div class="mb-4">
					<label for="day">{getTranslatedTimefield(locale, 'day', false, true)}</label>
					<input
						type="number"
						id="day"
						min="1"
						max={getDaysInMonth(year, month)}
						bind:value={day}
						class="mt-1 w-full" />
				</div>
				<div class="mb-4">
					<label for="hour">{$dictionary.clockSettings['Hour (24h)']}</label>
					<input type="number" id="hour" min="0" max="23" bind:value={hour} class="mt-1 w-full" />
				</div>
				<div class="mb-4">
					<label for="minute">{getTranslatedTimefield(locale, 'minute', false, true)}</label>
					<input
						type="number"
						id="minute"
						min="0"
						max="59"
						bind:value={minute}
						class="mt-1 w-full" />
				</div>
				<div class="mb-4">
					<label for="second">{getTranslatedTimefield(locale, 'second', false, true)}</label>
					<input
						type="number"
						id="second"
						min="0"
						max="59"
						bind:value={second}
						class="mt-1 w-full" />
				</div>
			</div>
		{/if}

		{#if dateTimeInputType !== 'dateText'}
			<label for="timezone-select" class="label">{$dictionary.labels['Timezone:']}</label>
			<select id="timezone-select" bind:value={timezone}>
				<option value="GMT">{$dictionary.labels['GMT']}</option>
				<option value="local"
					>{$dictionary.labels['Local']} ({Intl.DateTimeFormat().resolvedOptions()
						.timeZone})</option>
			</select>
		{/if}

		<Button icon="target" className="col-span-full" onclick={setToCurrent}>
			{$dictionary.sunriseSunsetSettings["Use today's date"]}
		</Button>
	</div>
{/if}

{#if dateTimeInputType === 'dateText'}
	<p class="mt-4 p-sm mb-2">
		{$dictionary.timestampSettings.convert.dateTextWarning[0]}
	</p>

	<p class="p-sm mb-2">
		{$dictionary.timestampSettings.convert.dateTextWarning[1].replace(
			'---',
			new Date('1970-01-01T00:00:00').getTime()
		)}
	</p>
	<p class="p-sm">
		{$dictionary.timestampSettings.convert.dateTextWarning[2].replace(
			'---',
			new Date('1970-01-01T00:00:00Z').getTime()
		)}
	</p>
{/if}
