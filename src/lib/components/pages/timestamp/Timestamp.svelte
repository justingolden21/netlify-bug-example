<script lang="ts">
	/**
	 * Parent component for /timestamp page that holds other timestamp related components
	 */

	import ConvertSecondsToUnits from '$lib/components/pages/timestamp/ConvertSecondsToUnits.svelte';
	import CurrentTimestamp from '$lib/components/pages/timestamp/CurrentTimestamp.svelte';
	import SecondsIn from '$lib/components/pages/timestamp/SecondsIn.svelte';
	import TimeDifference from '$lib/components/pages/timestamp/TimeDifference.svelte';
	import TimestampInfo from '$lib/components/pages/timestamp/TimestampInfo.svelte';
	import TimestampConvert from '$lib/components/pages/timestamp/TimestampConvert.svelte';
	import TimestampStartEnd from '$lib/components/pages/timestamp/TimestampStartEnd.svelte';
	import Tabs, { type Tab } from '$lib/components/ui/Tabs.svelte';
	import { dictionary } from '$lib/stores/languageDictionary';
	import { settings } from '$lib/stores/settings';

	const tabData = $derived([
		{
			name: $dictionary.timestampSettings.sectionTitles['Convert Timestamp or Date'],
			content: TimestampConvert
		},
		{
			name: $dictionary.timestampSettings.sectionTitles['Current Unix Timestamp'],
			content: CurrentTimestamp
		},
		{
			name: $dictionary.timestampSettings.sectionTitles['Time Difference'],
			content: TimeDifference
		},
		{
			name: $dictionary.timestampSettings.sectionTitles['Day, Month, Year Start/End'],
			content: TimestampStartEnd
		},
		{
			name: $dictionary.timestampSettings.sectionTitles['Convert Seconds to Other Units'],
			content: ConvertSecondsToUnits
		},
		{
			name: $dictionary.timestampSettings.sectionTitles['How Many Seconds In...'],
			content: SecondsIn
		},
		{
			name: $dictionary.timestampSettings.sectionTitles['Timestamp Information'],
			content: TimestampInfo
		}
	] as Tab[]);
</script>

{#if $settings.timestamp.displays.primary === 'default'}
	<div class="surface pad mb-16 lg:mb-10 overflow-x-auto">
		<TimestampConvert />
	</div>

	<div class="surface pad mb-16 lg:mb-10 overflow-x-auto">
		<CurrentTimestamp />
	</div>

	<div class="surface pad mb-16 lg:mb-10 overflow-x-auto">
		<TimeDifference />
	</div>

	<div class="surface pad mb-16 lg:mb-10 overflow-x-auto">
		<TimestampStartEnd />
	</div>

	<div class="surface pad mb-16 lg:mb-10 overflow-x-auto">
		<ConvertSecondsToUnits />
	</div>

	<div class="surface pad mb-16 lg:mb-10 overflow-x-auto">
		<SecondsIn />
	</div>

	<div class="surface pad mb-16 lg:mb-10 overflow-x-auto">
		<TimestampInfo />
	</div>
{:else}
	<Tabs tabs={tabData} alwaysColumn spaceBelow sticky={false} />
{/if}
