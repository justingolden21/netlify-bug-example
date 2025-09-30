<script lang="ts">
	// Data used: $settings.worldclock.timetable.ampm and $settings.worldclock.timetable.times

	import WorldclockDropdown from '$lib/components/pages/worldclock/WorldclockDropdown.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import SimpleTimePicker from '$lib/components/ui/SimpleTimePicker.svelte';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import { dictionary } from '$lib/stores/languageDictionary';
	import { settings } from '$lib/stores/settings';
	import getFormat from '$lib/util/getFormat';
	import { now } from '$lib/util/now.svelte';
	import { getHourDiff, getDateTime } from '$lib/util/timeText';
	import { getDiff, getSum } from '$lib/util/timetableDiff';

	function resetTimetableSettings() {
		$settings.worldclock.timetable.times = ['9:00', '12:00', '15:00', '18:00'];
		$settings.worldclock.timetable.ampm =
			Intl.DateTimeFormat(navigator.language, { hour: 'numeric' }).resolvedOptions().hourCycle ===
			'h12';
	}

	function worldclockTime(now: Date, timezone: string) {
		return getDateTime(now, getFormat('worldclock', 'time'), undefined, timezone);
	}
</script>

<!-- TODO: note that this doesn't account for daylight savings changes happening during this time period -->
<table class="p-sm striped mb-4">
	<thead>
		<tr>
			<th></th>
			<th>{$dictionary.labels['Difference']}</th>
			<th>{$dictionary.labels['Name']}</th>
			<th>{$dictionary.labels['Now']}</th>
			{#each $settings.worldclock.timetable.times as _time, idx}
				<th>
					<SimpleTimePicker
						ampm={$settings.worldclock.timetable.ampm ?? undefined}
						bind:value={$settings.worldclock.timetable.times[idx]}
						classes="my-4" />
				</th>
			{/each}
		</tr>
	</thead>
	<tbody class="group">
		{#each [{ name: $dictionary.labels['Home'], zone: $settings.locale.timezone }].concat($settings.worldclock.timezones) as timezone, idx (`${timezone.zone}-${timezone.name}`)}
			<tr>
				<td>
					{#if idx !== 0}
						<div class="w-10 h-10">
							<WorldclockDropdown idx={idx - 1} />
						</div>
					{/if}
				</td>
				<td>
					{#if idx !== 0 && timezone.zone}
						{getHourDiff(timezone.zone, now.value)}
					{/if}
				</td>
				{#if timezone.zone}
					<td>
						<p>{timezone.name || timezone.zone.split('_').join(' ')}</p>
					</td>
					<td class:font-normal={idx === 0}>{worldclockTime(now.value, timezone.zone)}</td>
				{/if}
				{#each $settings.worldclock.timetable.times as time}
					<!-- timetext
				get diff between time selector and current time
				then add diff to timezone time -->
					{#if timezone.zone && $settings.locale.timezone}
						{@const result = getSum(
							time,
							getDiff(
								worldclockTime(now.value, timezone.zone),
								worldclockTime(now.value, $settings.locale.timezone || 'Etc/GMT')
							)
						)}
						<td>
							{result.time}
							{#if result.days !== '0'}
								<span class="text-xs">
									{result.days}
								</span>
							{/if}
						</td>
					{/if}
				{/each}
			</tr>
		{/each}
	</tbody>
</table>

<div class="pad py-0 flex flex-col sm:flex-row gap-4 items-start">
	<Button icon="undo" animation="move-left" onclick={resetTimetableSettings}>
		{$dictionary.labels['Reset']}
	</Button>
	{#if $settings.worldclock.timetable.ampm !== null}
		<Toggle
			id="timetable-ampm-toggle"
			bind:checked={$settings.worldclock.timetable.ampm}
			labelText={$dictionary.labels['Use AM / PM']} />
	{/if}
</div>

<style lang="postcss">
	tr {
		@apply border-b-2 border-base-300;
	}
	:global(.dark) tr {
		@apply border-base-600;
	}
</style>
