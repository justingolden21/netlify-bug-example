<script module lang="ts">
	export type SunProperty =
		| 'sunrise'
		| 'sunriseEnd'
		| 'goldenHourEnd'
		| 'solarNoon'
		| 'goldenHour'
		| 'sunsetStart'
		| 'sunset'
		| 'dusk'
		| 'nauticalDusk'
		| 'night'
		| 'nadir'
		| 'nightEnd'
		| 'nauticalDawn'
		| 'dawn';
</script>

<script lang="ts">
	import dayjs from 'dayjs';
	import tz from 'dayjs/plugin/timezone.js';
	import utc from 'dayjs/plugin/utc.js';
	import type { GetSunPositionResult, GetTimesResult } from 'suncalc';
	import SunCalc from 'suncalc';
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';

	import NoLocation from '$lib/components/features/misc/NoLocation.svelte';
	import SunriseVector from '$lib/components/pages/sunrise/SunriseVector.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { dictionary } from '$lib/stores/languageDictionary';
	import { settings } from '$lib/stores/settings';
	import getFormat from '$lib/util/getFormat';
	import { open } from '$lib/util/modal.svelte';
	import { now } from '$lib/util/now.svelte';
	import { sunriseCurrentDateLocTimezone } from '$lib/util/sunriseCurrentDateLocTimezone';
	import { getDateTime } from '$lib/util/timeText';

	// https://day.js.org/docs/en/plugin/timezone
	// https://day.js.org/docs/en/timezone/timezone
	dayjs.extend(utc);
	dayjs.extend(tz);

	onMount(() => {
		/**
		 * Location defaults to 0,0 in `$settings`
		 * If location is not set (0,0) we try to get user's location on load
		 * If we fail, default to 0,0
		 *
		 * If the user actually wants to get the sunrise/sunset of null island,
		 * they can, but upon refresh it will run this logic again (they can always use 0,0.1 for example)
		 * Null island:
		 * @link https://www.geographyrealm.com/zero-degrees-latitude-and-zero-degrees-longitude/
		 */
		if (!locationChosen) {
			if (!navigator.geolocation) {
				$settings.sunrise.location = {
					lat: 0,
					long: 0,
					name: ''
				};
			} else {
				navigator.geolocation.getCurrentPosition(
					({ coords }) => {
						$settings.sunrise.location = {
							lat: coords.latitude,
							long: coords.longitude,
							name: ''
						};
					},
					() => {
						$settings.sunrise.location = {
							lat: 0,
							long: 0,
							name: ''
						};
					}
				);
			}
		}
	});

	// TODO: calendar for sunrises/sunsets, printable, sharable, etc.
	// TODO: share btn to share link to specific date and lat/long (enter timestamp, lat, long as url params)

	/**
	 * Datetime Formatting
	 */

	/**
	 * Return true if date is valid, else false
	 * Fairbanks, AK is a good test case for some valid and some invalid (64.8, 147.7)
	 * Use (90,-180) to test all values
	 * @link https://stackoverflow.com/a/1353711/4907950
	 */
	function isValidDate(d: Date) {
		return d instanceof Date && !isNaN(d?.getTime());
	}

	const getFormattedDateTime = (date: Date, type: 'date' | 'time') => {
		if (!isValidDate(date)) return '-';
		// Note: this uses `sunrise` timezone
		return getDateTime(
			date,
			getFormat('clock', type),
			undefined,
			$settings.sunrise.timezone || 'Etc/GMT'
		);
	};

	const msPerDay = 1000 * 60 * 60 * 24;

	/**
	 * More Utilities
	 */

	const round = (num: number) => Math.round(num * 100) / 100;

	// Takes in deg of sun position, between -180 and 180
	const getDirectionStr = (deg: number) => round(deg) + '&deg; ' + degreesToDirectionName(deg);

	function degreesToDirectionName(deg: number) {
		if (deg < 0) {
			deg = 360 + deg;
		}
		return ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.round((deg / 360) * 8)];
	}

	// convert number of ms to string with hrs and mins
	// used for daylight duration
	// todo: i18n
	const msToHourMins = (ms: number) => {
		const hrs = ms / 1000 / 60 / 60;
		const mins = (ms / 1000 / 60) % 60;
		return `${Math.floor(hrs)}h ${Math.floor(mins)}m`;
	};

	/**
	 * Sunrise and Sun Calculations
	 */

	// timestamp or -1 into ms
	const sunriseDateTimestamp = $derived(
		$settings.sunrise.date === -1 ? now.value.getTime() : $settings.sunrise.date
	);
	// ms into js date obj
	const sunriseDate = $derived(new Date(sunriseDateTimestamp));

	// sunlight times for current day and location
	const times = $derived(
		SunCalc.getTimes(
			sunriseDate,
			$settings.sunrise.location.lat,
			$settings.sunrise.location.long
		) as GetTimesResult
	);

	// get position of the sun (azimuth and altitude) at sunrise and sunset
	const sunrisePos = $derived(
		SunCalc.getPosition(
			times.sunrise,
			$settings.sunrise.location.lat,
			$settings.sunrise.location.long
		) as GetSunPositionResult
	);
	const sunsetPos = $derived(
		SunCalc.getPosition(
			times.sunset,
			$settings.sunrise.location.lat,
			$settings.sunrise.location.long
		) as GetSunPositionResult
	);

	// get sunrise and sunset azimuth in degrees
	const sunriseAzimuth = $derived((sunrisePos.azimuth * 180) / Math.PI + 180);
	const sunsetAzimuth = $derived((sunsetPos.azimuth * 180) / Math.PI + 180);

	const sunriseSunsetValid = $derived(isValidDate(times.sunrise) && isValidDate(times.sunset));

	const locationChosen = $derived(
		$settings.sunrise.location.lat !== 0 || $settings.sunrise.location.long !== 0
	);

	const sunProperties = [
		'sunriseEnd',
		'sunsetStart',
		'dawn',
		'dusk',
		'nauticalDawn',
		'nauticalDusk',
		'solarNoon',
		'nadir',
		'nightEnd',
		'night',
		'goldenHourEnd',
		'goldenHour'
	] as SunProperty[];
</script>

{#if $settings.sunrise.displays.secondary !== 'none'}
	<div
		class="grid grid-cols-2 xl:grid-cols-4 gap-4 md:gap-10 surface pad overflow-auto mb-10"
		transition:fly|local={{ y: -160, duration: 250 }}>
		{#if $settings.sunrise.displays.secondary === 'full'}
			<div class="col-span-full" transition:fly|local={{ y: -160, duration: 250 }}>
				<Button
					size="lg"
					animation="zoom"
					icon="target"
					className="w-full"
					onclick={sunriseCurrentDateLocTimezone}>
					{$dictionary.sunriseSunsetSettings['Use current date, location, and timezone']}
				</Button>
			</div>
		{/if}

		<div class="break-words">
			{#if $settings.sunrise.displays.secondary === 'full'}
				<p class="p-sm">
					{$dictionary.labels['Local time:']}
				</p>
			{/if}
			<p class="p-lg">
				{getFormattedDateTime(now.value, 'time')}
			</p>
		</div>
		<div class="break-words">
			{#if $settings.sunrise.displays.secondary === 'full'}
				<p class="p-sm">
					{$dictionary.labels['Date']}:
				</p>
			{/if}
			<p class="p-lg">
				{getFormattedDateTime(sunriseDate, 'date')}
			</p>
			{#if $settings.sunrise.displays.secondary === 'full'}
				<Button
					size="icon"
					iconSize="sm"
					icon="pencil"
					variant="ghost"
					title={$dictionary.sunriseSunsetSettings['Edit date']}
					onclick={() => open('sunrise-edit-date')}>
				</Button>
			{/if}
		</div>
		<div class="break-words">
			{#if $settings.sunrise.displays.secondary === 'full'}
				<p class="p-sm">
					{$dictionary.labels['Location:']}
				</p>
			{/if}
			<p class="p-lg">
				{round($settings.sunrise.location.lat)}&deg;, {round($settings.sunrise.location.long)}&deg;
				{#if $settings.sunrise.location.name !== ''}
					&mdash; {$settings.sunrise.location.name}
				{/if}
			</p>
			{#if $settings.sunrise.displays.secondary === 'full'}
				<Button
					size="icon"
					iconSize="sm"
					icon="pencil"
					variant="ghost"
					title={$dictionary.sunriseSunsetSettings['Edit location']}
					onclick={() => open('sunrise-edit-location', { page: 'sunrise' })}>
				</Button>
			{/if}
		</div>
		<div class="break-words">
			{#if $settings.sunrise.displays.secondary === 'full'}
				<p class="p-sm">
					{$dictionary.labels['Timezone:']}
				</p>
			{/if}
			<p class="p-lg">
				{$settings.sunrise.timezone?.replace(/_/g, ' ') || 'Etc/GMT'}
			</p>
			{#if $settings.sunrise.displays.secondary === 'full'}
				<Button
					size="icon"
					iconSize="sm"
					icon="pencil"
					variant="ghost"
					title={$dictionary.sunriseSunsetSettings['Edit timezone']}
					onclick={() => open('sunrise-edit-timezone')}>
				</Button>
			{/if}
		</div>
	</div>
{/if}

<div class="relative">
	{#if !locationChosen}
		<NoLocation />
	{/if}

	{#if $settings.sunrise.displays.primary !== 'none'}
		<div class="surface pad overflow-x-auto" transition:fly|local={{ y: -160, duration: 250 }}>
			<div
				class="flex flex-col sm:flex-row md:flex-col lg:flex-row sm:justify-between gap-4 sm:gap-10">
				<div>
					<div class="flex items-center justify-start">
						<Icon name="sunrise" />
						<h4 class="p-lg ml-2 mr-6">
							{$dictionary.sunriseSunsetSettings.sunProperties['sunrise']}
						</h4>
						{#if !isNaN(sunriseAzimuth)}
							<span class="p-sm mr-1">{@html getDirectionStr(sunriseAzimuth)}</span>
							<div style="transform: rotate({sunriseAzimuth}deg);">
								<Icon name="arrow_up" size="sm" />
							</div>
						{/if}
					</div>
					<p class="h1">{getFormattedDateTime(times.sunrise, 'time')}</p>
				</div>
				<div>
					<div class="flex items-center justify-start">
						<Icon name="sunset" />
						<h4 class="p-lg ml-2 mr-6">
							{$dictionary.sunriseSunsetSettings.sunProperties['sunset']}
						</h4>
						{#if !isNaN(sunsetAzimuth)}
							<span class="p-sm mr-1">{@html getDirectionStr(sunsetAzimuth)}</span>
							<div style="transform: rotate({sunsetAzimuth}deg);">
								<Icon name="arrow_up" size="sm" />
							</div>
						{/if}
					</div>
					<p class="h1">{getFormattedDateTime(times.sunset, 'time')}</p>
				</div>
			</div>

			{#if $settings.sunrise.date === -1}
				<!-- only show if today's date - sun is shown relative to current time -->
				<div class="w-64 sm:w-96 sm:mx-auto my-10">
					<!-- Uncomment for debugging: -->
					<!-- {#each Array(50) as _, idx}
						{idx / 2} hours ago
						<SunriseVector
							sunrise={times.sunrise.getTime()}
							sunset={times.sunset.getTime()}
							nadir={times.nadir.getTime()}
							currentTime={$now.getTime() - (1000 * 60 * 60 * idx) / 2} />
					{/each} -->
					{#if isValidDate(times.sunrise) && isValidDate(times.sunset) && isValidDate(times.nadir)}
						<SunriseVector
							sunrise={times.sunrise.getTime()}
							sunset={times.sunset.getTime()}
							nadir={times.nadir.getTime()}
							currentTime={now.value.getTime()} />
					{/if}
				</div>
			{/if}

			{#if $settings.sunrise.displays.primary === 'full'}
				<div
					class="grid grid-cols-2 xl:grid-cols-3 gap-4"
					transition:fly|local={{ y: -160, duration: 250 }}>
					<div class="col-span-full mb-6">
						{#if sunriseSunsetValid}
							<p class="p mb-2">
								{$dictionary.labels['Daylight duration']}:
								<span class="font-bold">
									{msToHourMins(times.sunset.getTime() - times.sunrise.getTime())}
								</span>
							</p>
						{/if}

						<!-- TODO: consider showing time until tomorrow's sunrise/set if not -->
						<!-- These only display if chosen date's sunrise/sunset is after current time -->
						{#if isValidDate(times.sunrise) && times.sunrise.getTime() - now.value.getTime() > 0}
							<p class="p mb-2">
								{$dictionary.labels['Time until sunrise:']}
								<span class="font-bold">
									{msToHourMins(times.sunrise.getTime() - now.value.getTime())}
								</span>
							</p>
						{/if}
						{#if isValidDate(times.sunset) && times.sunset.getTime() - now.value.getTime() > 0}
							<p class="p mb-2">
								{$dictionary.labels['Time until sunset:']}
								<span class="font-bold">
									{msToHourMins(times.sunset.getTime() - now.value.getTime())}
								</span>
							</p>
						{/if}

						<Button
							icon="info"
							variant="outline"
							animation="move-up"
							className="mr-4"
							onclick={() => open('about-sun-times')}>
							{$dictionary.settingsTabs['About']}
						</Button>
					</div>
					{#each sunProperties as sunProperty}
						<p class="p mb-2">
							<span class="block sm:inline-block">
								{$dictionary.sunriseSunsetSettings.sunProperties[sunProperty]}:
							</span>
							<span class="font-bold">
								{getFormattedDateTime(times[sunProperty], 'time')}
							</span>
						</p>
					{/each}
				</div>
			{/if}
		</div>
	{/if}

	{#if $settings.sunrise.table.show}
		<div
			class="surface pad mt-10 overflow-x-auto"
			transition:fly|local={{ y: -160, duration: 250 }}>
			<table class="p striped text-right">
				<thead>
					<tr>
						<th>{$dictionary.labels['Date']}</th>
						{#each $settings.sunrise.table.cols as sunProperty}
							<th>{$dictionary.sunriseSunsetSettings.sunProperties[sunProperty]}</th>
						{/each}
						<th>{$dictionary.labels['Daylight duration']}</th>
					</tr>
				</thead>
				<tbody>
					{#each Array($settings.sunrise.table.rows) as _, idx}
						{@const day = new Date(sunriseDateTimestamp + msPerDay * idx)}
						{@const sunTimes = SunCalc.getTimes(
							day,
							$settings.sunrise.location.lat,
							$settings.sunrise.location.long
						)}
						<tr>
							<td>{getFormattedDateTime(day, 'date')} </td>
							{#each $settings.sunrise.table.cols as sunProperty}
								<td>{getFormattedDateTime(sunTimes[sunProperty], 'time')}</td>
							{/each}
							<td>
								{#if sunriseSunsetValid}
									{msToHourMins(sunTimes.sunset.getTime() - sunTimes.sunrise.getTime())}
								{:else}
									-
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

<style lang="postcss">
	th,
	td {
		white-space: nowrap;
	}
</style>
