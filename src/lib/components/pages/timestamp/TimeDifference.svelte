<script lang="ts">
	/**
	 * Timestamp section that allows the user to calculate the difference between two datetimes
	 */

	import { onMount } from 'svelte';

	import Button from '$lib/components/ui/Button.svelte';
	import { dictionary } from '$lib/stores/languageDictionary';
	import { settings } from '$lib/stores/settings';
	import { msToString } from '$lib/util/timestamp';
	import getTranslatedTimefield from '$lib/util/getTranslatedTimefield';

	type Option = 'timestamp' | 'datetime' | 'now';

	let leftOption: Option = $state('timestamp');
	let rightOption: Option = $state('datetime');
	let leftTimestamp: number = $state(Date.now());
	let rightTimestamp: number = $state(Date.now());
	let leftTimestampMode: 'seconds' | 'milliseconds' = $state('milliseconds');
	let rightTimestampMode: 'seconds' | 'milliseconds' = $state('milliseconds');
	let leftTimezone: 'GMT' | 'local' = $state('local');
	let rightTimezone: 'GMT' | 'local' = $state('local');
	let leftDate: string = $state('');
	let leftTime: string = $state('');
	let rightDate: string = $state('');
	let rightTime: string = $state('');
	let diff: number = $state(0);
	let leftDateTime: string = $state('');
	let leftDateTimeGMT: string = $state('');
	let rightDateTime: string = $state('');
	let rightDateTimeGMT: string = $state('');

	const locale = $derived($settings.locale.language ?? 'en');

	let leftInvalid = $state(false);
	let rightInvalid = $state(false);

	onMount(updateNow);

	function updateNow() {
		const now = Date.now();
		if (leftOption === 'now')
			leftTimestamp = leftTimestampMode === 'seconds' ? Math.floor(now / 1000) : now;
		if (rightOption === 'now')
			rightTimestamp = rightTimestampMode === 'seconds' ? Math.floor(now / 1000) : now;
		calculateDifference();
	}

	function calculateDifference() {
		let leftValue: number;
		let rightValue: number;

		if (leftOption === 'timestamp') {
			if (leftTimestamp === null) {
				// to correctly identify invalid input
				// while still allowing user to delete '0' character
				leftTimestamp = NaN;
			}
			leftValue = leftTimestamp;
			if (leftTimestampMode === 'seconds') leftValue *= 1000;
		} else if (leftOption === 'datetime') {
			leftValue = new Date(`${leftDate}T${leftTime}${leftTimezone === 'GMT' ? 'Z' : ''}`).getTime();
			leftTimestamp = leftValue;
		} else {
			leftValue = Date.now();
			leftTimestamp = leftValue;
		}

		leftDateTime = new Date(leftValue).toLocaleString();
		leftDateTimeGMT = new Date(leftValue).toLocaleString(undefined, { timeZone: 'Etc/GMT' });
		leftInvalid = !isValidTimestamp(leftValue);

		if (rightOption === 'timestamp') {
			if (rightTimestamp === null) {
				// to correctly identify invalid input
				// while still allowing user to delete '0' character
				rightTimestamp = NaN;
			}
			rightValue = rightTimestamp;
			if (rightTimestampMode === 'seconds') rightValue *= 1000;
		} else if (rightOption === 'datetime') {
			rightValue = new Date(
				`${rightDate}T${rightTime}${rightTimezone === 'GMT' ? 'Z' : ''}`
			).getTime();
			rightTimestamp = rightValue;
		} else {
			rightValue = Date.now();
			rightTimestamp = rightValue;
		}

		rightDateTime = new Date(rightValue).toLocaleString();
		rightDateTimeGMT = new Date(rightValue).toLocaleString(undefined, { timeZone: 'Etc/GMT' });
		rightInvalid = !isValidTimestamp(rightValue);

		diff = rightValue - leftValue;
	}

	function setCurrentTimestamp(side: 'left' | 'right') {
		if (side === 'left') {
			leftTimestamp = leftTimestampMode === 'seconds' ? Math.round(Date.now() / 1000) : Date.now();
		} else {
			rightTimestamp =
				rightTimestampMode === 'seconds' ? Math.round(Date.now() / 1000) : Date.now();
		}

		updateNow();
	}

	function setCurrentDatetime(side: 'left' | 'right') {
		const now = new Date();
		let nowDate, nowTime;

		// Set `nowDate` and `nowTime` to appropriate date string and time string based on user selected timezone (GMT or local)
		if (
			(side === 'left' && leftTimezone === 'GMT') ||
			(side === 'right' && rightTimezone === 'GMT')
		) {
			// Convert to GMT
			const nowGMT = new Date(now.toISOString());
			nowDate = nowGMT.toISOString().split('T')[0];
			nowTime = nowGMT.toISOString().split('T')[1].split('.')[0];
		} else {
			// Use local time
			nowDate = now.toLocaleDateString('en-CA'); // 'en-CA' format is YYYY-MM-DD
			nowTime = now.toTimeString().split(' ')[0];
		}

		// Set left or right date and time based on which side should be changed
		if (side === 'left') {
			leftDate = nowDate;
			leftTime = nowTime;
		} else {
			rightDate = nowDate;
			rightTime = nowTime;
		}

		updateNow();
	}

	function timestampFormatChange(side: 'left' | 'right') {
		if (side === 'left') {
			if (!isValidTimestamp(leftTimestamp)) return;

			if (leftTimestampMode === 'seconds') leftTimestamp = Math.round(leftTimestamp / 1000);
			else leftTimestamp = leftTimestamp * 1000;
		} else {
			if (!isValidTimestamp(rightTimestamp)) return;

			if (rightTimestampMode === 'seconds') rightTimestamp = Math.round(rightTimestamp / 1000);
			else rightTimestamp = rightTimestamp * 1000;
		}
	}

	// Returns true if is a number and not NaN
	// Ex. 3, 0, -2.5, Infinity return true
	// Ex. '33', 'hello', true, false, NaN, null, undefined return false
	function isValidNum(maybeNum: any) {
		return typeof maybeNum === 'number' && !isNaN(maybeNum);
	}

	// Check if a value is a valid timestamp
	// Checks both that it's a valid number and that the created `Date` object is valid
	// Eg. -9999999999999999 is invalid but -999999999999999 is valid because only the first one results in an invalid date
	function isValidTimestamp(maybeNumTimestamp: any) {
		if (!isValidNum(maybeNumTimestamp)) return false;
		return !isNaN(new Date(maybeNumTimestamp).getTime());
	}
</script>

<h2 class="h2 mb-4">{$dictionary.timestampSettings.sectionTitles['Time Difference']}</h2>

<div class="flex flex-col sm:flex-row gap-4 lg:gap-6">
	<div
		class="flex-1 flex flex-col gap-4 pb-4 sm:pb-0 sm:pr-4 border-b sm:border-b-0 sm:border-r border-base-300 dark:border-base-600">
		<select
			class="w-full"
			aria-label={$dictionary.labels['Input type:']}
			bind:value={leftOption}
			onchange={updateNow}>
			<option value="timestamp">{$dictionary.rubiksSettings['Timestamp']}</option>
			<option value="datetime">{$dictionary.timestampSettings.convert['Date and Time']}</option>
			<option value="now">{$dictionary.labels['Now']}</option>
		</select>
		{#if leftOption === 'timestamp'}
			<input
				type="number"
				class="w-full"
				aria-label={$dictionary.rubiksSettings['Timestamp']}
				bind:value={leftTimestamp}
				oninput={calculateDifference} />
			<select
				class="w-full"
				aria-label={$dictionary.labels['Units']}
				bind:value={leftTimestampMode}
				onchange={() => timestampFormatChange('left')}>
				<option value="seconds">{getTranslatedTimefield(locale, 'second', true, true)}</option>
				<option value="milliseconds">
					{getTranslatedTimefield(locale, 'millisecond', true, true)}
				</option>
			</select>
			<Button icon="target" animation="zoom" onclick={() => setCurrentTimestamp('left')}>
				{$dictionary.sunriseSunsetSettings["Use today's date"]}
			</Button>
		{:else if leftOption === 'datetime'}
			<input
				type="date"
				class="w-full"
				aria-label={$dictionary.labels['Date']}
				bind:value={leftDate}
				oninput={calculateDifference} />
			<input
				type="time"
				class="w-full"
				aria-label={$dictionary.labels['Time']}
				bind:value={leftTime}
				oninput={calculateDifference} />
			<label for="left-timezone-select" class="label">{$dictionary.labels['Timezone:']}</label>
			<select id="left-timezone-select" bind:value={leftTimezone} onchange={calculateDifference}>
				<option value="GMT">{$dictionary.labels['GMT']}</option>
				<option value="local">{$dictionary.labels['Local']}</option>
			</select>
			<Button icon="target" animation="zoom" onclick={() => setCurrentDatetime('left')}>
				{$dictionary.sunriseSunsetSettings["Use today's date"]}
			</Button>
		{/if}

		{#if leftInvalid}
			{$dictionary.error['Invalid input']}
		{:else}
			<p>{leftDateTime}</p>
			<p>{leftDateTimeGMT} {$dictionary.labels['GMT']}</p>
			<p>{$dictionary.timestampSettings.convert['Timestamp:']} {leftTimestamp}</p>
		{/if}
	</div>

	<div class="flex-1 flex flex-col gap-4">
		<select
			class="w-full"
			aria-label={$dictionary.labels['Input type:']}
			bind:value={rightOption}
			onchange={updateNow}>
			<option value="timestamp">{$dictionary.rubiksSettings['Timestamp']}</option>
			<option value="datetime">{$dictionary.timestampSettings.convert['Date and Time']}</option>
			<option value="now">{$dictionary.labels['Now']}</option>
		</select>
		{#if rightOption === 'timestamp'}
			<input
				type="number"
				class="w-full"
				aria-label={$dictionary.rubiksSettings['Timestamp']}
				bind:value={rightTimestamp}
				oninput={calculateDifference} />
			<select
				class="w-full"
				aria-label={$dictionary.labels['Units']}
				bind:value={rightTimestampMode}
				onchange={() => timestampFormatChange('right')}>
				<option value="seconds">{getTranslatedTimefield(locale, 'second', true, true)}</option>
				<option value="milliseconds">
					{getTranslatedTimefield(locale, 'millisecond', true, true)}
				</option>
			</select>

			<Button icon="target" animation="zoom" onclick={() => setCurrentTimestamp('right')}>
				{$dictionary.sunriseSunsetSettings["Use today's date"]}
			</Button>
		{:else if rightOption === 'datetime'}
			<input
				type="date"
				class="w-full"
				aria-label={$dictionary.labels['Date']}
				bind:value={rightDate}
				oninput={calculateDifference} />
			<input
				type="time"
				class="w-full"
				aria-label={$dictionary.labels['Time']}
				bind:value={rightTime}
				oninput={calculateDifference} />
			<label for="right-timezone-select" class="label">{$dictionary.labels['Timezone:']}</label>
			<select id="right-timezone-select" bind:value={rightTimezone} onchange={calculateDifference}>
				<option value="GMT">{$dictionary.labels['GMT']}</option>
				<option value="local">{$dictionary.labels['Local']}</option>
			</select>
			<Button icon="target" animation="zoom" onclick={() => setCurrentDatetime('right')}>
				{$dictionary.sunriseSunsetSettings["Use today's date"]}
			</Button>
		{/if}
		{#if rightInvalid}
			{$dictionary.error['Invalid input']}
		{:else}
			<p>{rightDateTime}</p>
			<p>{rightDateTimeGMT} {$dictionary.labels['GMT']}</p>
			<p>{$dictionary.timestampSettings.convert['Timestamp:']} {rightTimestamp}</p>
		{/if}
	</div>
</div>

{#if !leftInvalid && !rightInvalid}
	<hr class="my-6 mx-auto" />

	<div class="text-center">
		<p class="p-lg">
			{$dictionary.timestampSettings.difference[
				diff > 0 ? 'first behind' : diff < 0 ? 'first ahead' : 'first same'
			]}
		</p>
		<p class="h3 mb-4">{msToString(Math.abs(diff), $settings.locale.datetime ?? 'en')}</p>
		<p class="h4">
			{Math.abs(diff)}
			{getTranslatedTimefield(locale, 'millisecond', true, true)}
		</p>
		<p class="h4">
			{Math.abs(Math.round(diff / 1000))}
			{getTranslatedTimefield(locale, 'second', true, true)}
		</p>
	</div>
{/if}
