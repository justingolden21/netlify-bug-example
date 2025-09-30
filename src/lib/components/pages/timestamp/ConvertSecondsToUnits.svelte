<script lang="ts">
	/**
	 * Timestamp section to convert seconds (or other units) to different units
	 */

	import { settings } from '$lib/stores/settings';
	import { dictionary } from '$lib/stores/languageDictionary';
	import { sToString } from '$lib/util/timestamp';
	import getTranslatedTimefield from '$lib/util/getTranslatedTimefield';

	type Unit = 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years';

	let input = $state(90000);
	let unit: Unit = $state('seconds');

	const locale = $derived($settings.locale.language ?? 'en');
	const seconds = $derived(inputToSeconds(input, unit));

	function inputToSeconds(input: number, unit: Unit) {
		switch (unit) {
			case 'seconds':
				return input;
			case 'minutes':
				return input * 60;
			case 'hours':
				return input * 3600;
			case 'days':
				return input * 3600 * 24;
			case 'weeks':
				return input * 3600 * 24 * 7;
			case 'months':
				return input * 3600 * 24 * (365.2425 / 12);
			case 'years':
				return input * 3600 * 24 * 365.2425;
		}
	}
</script>

<h2 class="h2 mb-2">
	{$dictionary.timestampSettings.sectionTitles['Convert Seconds to Other Units']}
</h2>

<div class="flex items-center gap-2 mb-4">
	<input
		type="number"
		min="0"
		max="99999999999999999999999999999999"
		aria-label={$dictionary.labels['Units']}
		bind:value={input} />
	<select bind:value={unit} aria-label={$dictionary.labels['Units']}>
		<option value="seconds">{getTranslatedTimefield(locale, 'second', true, true)}</option>
		<option value="minutes">{getTranslatedTimefield(locale, 'minute', true, true)}</option>
		<option value="hours">{getTranslatedTimefield(locale, 'hour', true, true)}</option>
		<option value="days">{getTranslatedTimefield(locale, 'day', true, true)}</option>
		<option value="weeks">{getTranslatedTimefield(locale, 'week', true, true)}</option>
		<option value="months">{getTranslatedTimefield(locale, 'month', true, true)}</option>
		<option value="years">{getTranslatedTimefield(locale, 'year', true, true)}</option>
	</select>
</div>

<p class="p-lg mb-2">{sToString(seconds ?? 0, $settings.locale.language ?? 'en')}</p>

<p class="p">{seconds ?? 0} {getTranslatedTimefield(locale, 'second', true)}</p>
<p class="p">{(seconds / 60).toFixed(4)} {getTranslatedTimefield(locale, 'minute', true)}</p>
<p class="p">{(seconds / 3600).toFixed(4)} {getTranslatedTimefield(locale, 'hour', true)}</p>
<p class="p">{(seconds / (24 * 3600)).toFixed(4)} {getTranslatedTimefield(locale, 'day', true)}</p>
<p class="p">
	{(seconds / (7 * 24 * 3600)).toFixed(4)}
	{getTranslatedTimefield(locale, 'week', true)}
</p>
<p class="p">
	{(seconds / ((365.2425 / 12) * 24 * 3600)).toFixed(4)}
	{getTranslatedTimefield(locale, 'month', true)}
</p>
<p class="p">
	{(seconds / (365.2425 * 24 * 3600)).toFixed(4)}
	{getTranslatedTimefield(locale, 'year', true)}
</p>

<p class="mt-4 p-sm">
	{$dictionary.timestampSettings.secondsToUnits.yearLengthInDaysDisclaimer}
	<a
		href="https://www.grc.nasa.gov/www/k-12/Numbers/Math/Mathematical_Thinking/calendar_calculations.htm"
		target="_blank"
		rel="noopener noreferrer"
		class="a">{$dictionary.labels['Read more']}</a>
</p>
