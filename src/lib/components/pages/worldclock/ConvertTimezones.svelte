<script lang="ts">
	import dayjs from 'dayjs';
	import timezone from 'dayjs/plugin/timezone';
	dayjs.extend(timezone);

	import TimezoneAutocomplete from '$lib/components/features/misc/TimezoneAutocomplete.svelte';
	import { dictionary } from '$lib/stores/languageDictionary';

	let inputTimezone: string = $state(Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'Etc/GMT');
	let outputTimezone: string = $state(
		Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'Etc/GMT'
	);
	let time: string = $state(
		new Date().toLocaleString(undefined, {
			hour12: false,
			minute: '2-digit',
			hour: '2-digit'
		})
	);

	const AMPM =
		Intl.DateTimeFormat(navigator.language, { hour: 'numeric' }).resolvedOptions().hourCycle ===
		'h12';

	const output = $derived(
		inputTimezone && outputTimezone && time
			? dayjs()
					.set('hour', parseInt(time.split(':')[0]))
					.set('minute', parseInt(time.split(':')[1]))
					.tz(inputTimezone, true)
					.tz(outputTimezone)
					.format(AMPM ? 'h:mm A' : 'H:mm')
			: ''
	);
</script>

<div class="pad flex flex-col gap-4">
	<label class="flex flex-col gap-1">
		<input type="time" class="!text-xl w-64" bind:value={time} />
	</label>

	<label class="flex flex-col gap-1">
		<p class="p-lg">{$dictionary.worldclockSettings['in']}</p>
		<TimezoneAutocomplete bind:value={inputTimezone} />
	</label>

	<p class="p-lg">{$dictionary.worldclockSettings['is']}</p>

	<output class="h2">
		{output}
	</output>

	<label class="flex flex-col gap-1">
		<p class="p-lg">{$dictionary.worldclockSettings['in']}</p>
		<TimezoneAutocomplete bind:value={outputTimezone} />
	</label>

	<hr class="my-10" />

	<p class="p-sm">
		{$dictionary.worldclockSettings.daylightSavingsConvertWarning}
	</p>
</div>
