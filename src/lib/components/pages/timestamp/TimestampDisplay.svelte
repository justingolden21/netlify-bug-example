<script lang="ts">
	/**
	 * Displays info about a given timestamp (in ms)
	 *
	 * Child of `TimestampConvert`
	 */

	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime';
	import tz from 'dayjs/plugin/timezone';
	import utc from 'dayjs/plugin/utc';
	dayjs.extend(utc);
	dayjs.extend(tz);
	dayjs.extend(relativeTime);

	import Icon from '$lib/components/ui/Icon.svelte';
	import { dictionary } from '$lib/stores/languageDictionary';
	import { settings } from '$lib/stores/settings';
	import { timestampToDate, timestampToDateGMT, msToString } from '$lib/util/timestamp';

	interface Props {
		timestamp: number;
	}

	const { timestamp }: Props = $props();

	const msSinceEpoch = $derived(timestamp);
	const sSinceEpoch = $derived(Math.round(timestamp / 1000));

	const dateTimeGMT = $derived(timestampToDateGMT(timestamp));
	const dateTimeLocal = $derived(timestampToDate(timestamp));

	const targetTime = $derived(dayjs.unix(sSinceEpoch));

	// Reactive to changes to both `settings.locale.datetime` and to `targetTime`
	const timeFromNow = $derived(
		dayjs()
			.locale($settings.locale.language ?? 'en')
			.to(targetTime, true)
	);

	const diffMs = $derived(targetTime.diff(dayjs(), 'millisecond'));
	const totalSecondsFromNow = $derived(Math.round(diffMs / 1000));

	const formattedDuration = $derived(msToString(diffMs, $settings.locale.datetime ?? 'en'));

	const formatISO8601 = $derived(new Date(timestamp).toISOString());
	const formatRFC1123 = $derived(new Date(timestamp).toUTCString().replace('GMT', '+0000'));

	// todo: redundant from `timeText.ts`
	const timeFormat =
		$settings.clock.timeFormat !== 'custom'
			? $settings.clock.timeFormat
			: $settings.clock.timeFormatCustom;
	const dateFormat =
		$settings.clock.dateFormat !== 'custom'
			? $settings.clock.dateFormat
			: $settings.clock.dateFormatCustom;

	const timestampObj = $derived(
		dayjs(timestamp)
			.tz($settings.locale.timezone || 'Etc/GMT')
			.locale($settings.locale.datetime || 'en')
	);
	const humanReadableTime = $derived(timestampObj.format(timeFormat || 'h:mm A'));
	const humanReadableDate = $derived(timestampObj.format(dateFormat || 'ddd, MMMM D'));
	const humanReadableYear = $derived(timestampObj.format('YYYY'));

	const timestampObjGMT = $derived(
		dayjs(timestamp)
			.utc() // ensure timestamp interpreted in UTC
			.locale($settings.locale.datetime || 'en')
	);
	const humanReadableTimeGMT = $derived(timestampObjGMT.format(timeFormat || 'h:mm A'));
	const humanReadableDateGMT = $derived(timestampObjGMT.format(dateFormat || 'ddd, MMMM D'));
	const humanReadableYearGMT = $derived(timestampObjGMT.format('YYYY'));
</script>

<h3 class="h3">
	<Icon name="output" />
	{$dictionary.timestampSettings.convert['Timestamp Information']}
</h3>
<div class="overflow-x-auto grid xl:grid-cols-2 xl:gap-x-6">
	<div>
		<hr class="my-4 sm:my-6 lg:my-10" />
		<h2 class="h2 font-light mb-2">
			{$dictionary.rubiksSettings['Timestamp']}
		</h2>
		<p class="p-sm mb-6">
			{$dictionary.timestampSettings.convert['Time since epoch. Timestamp is in GMT']}
		</p>
		<p class="p-lg mb-4">
			{msSinceEpoch} <span class="p-sm">{$dictionary.rubiksSettings['milliseconds_short']}</span>
		</p>
		<p class="p-lg mb-4">
			{sSinceEpoch} <span class="p-sm">{$dictionary.rubiksSettings['seconds_short']}</span>
		</p>
	</div>

	<div>
		<hr class="my-4 sm:my-6 lg:my-10" />
		<h2 class="h2 font-light mb-2">
			{$dictionary.labels['Local']}
			<span class="h4 font-light">({$settings.locale.timezone || 'Etc/GMT'})</span>
		</h2>
		<p class="p-sm mb-6">{dateTimeLocal}</p>
		<p class="p-lg">{humanReadableTime}</p>
		<p class="p-lg">{humanReadableDate}</p>
		<p class="p-lg">{humanReadableYear}</p>

		<h2 class="h2 font-light mt-10 mb-2">
			{$dictionary.labels['GMT']}
		</h2>
		<p class="p-sm mb-6">{dateTimeGMT}</p>
		<p class="p-lg">{humanReadableTimeGMT}</p>
		<p class="p-lg">{humanReadableDateGMT}</p>
		<p class="p-lg">{humanReadableYearGMT}</p>
	</div>

	<div>
		<hr class="my-4 sm:my-6 lg:my-10" />
		<h2 class="h2 font-light mb-6">
			{$dictionary.timestampSettings.convert['Relative to Now']}
		</h2>
		<p class="p-sm">
			{$dictionary.timestampSettings.convert['Time from now']}
		</p>
		<p class="p-lg mb-4">{timeFromNow}</p>
		<p class="p-sm">
			{$dictionary.timestampSettings.convert['Total seconds from now']}
		</p>
		<p class="p-lg mb-4">{totalSecondsFromNow}</p>
		<p class="p-sm">
			{$dictionary.timestampSettings.convert['Duration from now']}
		</p>
		<p class="p-lg mb-4">{formattedDuration}</p>
	</div>

	<!-- Note: translations for ISO/RFC not necessary for currently supported langs -->
	<div>
		<hr class="my-4 sm:my-6 lg:my-10" />
		<h2 class="h2 font-light mb-6">
			{$dictionary.timestampSettings.convert['Date Time Specifications']}
		</h2>
		<p class="p-sm">ISO 8601 / RFC 3339</p>
		<p class="p-lg mb-4">{formatISO8601}</p>
		<p class="p-sm">RFC 822, 1036, 1123, 2822</p>
		<p class="p-lg">{formatRFC1123}</p>
	</div>
</div>
