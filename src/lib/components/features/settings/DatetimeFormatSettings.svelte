<script lang="ts">
	// digital datetime settings - settings for time and date format
	import dayjs from 'dayjs';

	import SettingSelect from '$lib/components/features/settings/SettingSelect.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { defaultDateFormats, defaultTimeFormats, timeFormatSettings } from '$lib/data/consts';
	import { dictionary } from '$lib/stores/languageDictionary';
	import { defaultSettings, settings } from '$lib/stores/settings';
	import { open } from '$lib/util/modal.svelte';
	import { now } from '$lib/util/now.svelte';

	interface Props {
		page: 'clock' | 'worldclock';
	}

	const { page }: Props = $props();
</script>

<div class="mb-4">
	<SettingSelect
		id="time-format-select"
		selectLabel={$dictionary.clockSettings['Time format:']}
		bind:value={$settings[page].timeFormat}
		values={defaultTimeFormats}
		labelMapper={(timeFormat) =>
			timeFormat === 'custom'
				? $dictionary.clockSettings['Custom']
				: dayjs(now.value)
						.tz($settings.locale.timezone ?? 'Etc/GMT')
						.locale($settings.locale.datetime ?? 'en')
						.format?.(typeof timeFormat === 'string' ? timeFormat : 'H:mm')} />

	{#if $settings[page].timeFormat === 'custom'}
		<div class="my-2 ml-6">
			<input
				type="text"
				spellcheck="false"
				class="block my-2"
				bind:value={$settings[page].timeFormatCustom} />
			<p>
				<b>{$dictionary.clockSettings['Preview:']}</b>
				{dayjs(now.value)
					.tz($settings.locale.timezone ?? 'Etc/GMT')
					.locale($settings.locale.datetime ?? 'en')
					.format?.($settings[page].timeFormatCustom ?? 'H:mm')}
			</p>
		</div>
	{/if}
</div>

<div class="mb-4">
	<SettingSelect
		id="date-format-select"
		selectLabel={$dictionary.clockSettings['Date format:']}
		bind:value={$settings[page].dateFormat}
		values={defaultDateFormats}
		labelMapper={(dateFormat) =>
			dateFormat === 'custom'
				? $dictionary.clockSettings['Custom']
				: dayjs(now.value)
						.tz($settings.locale.timezone ?? 'Etc/GMT')
						.locale($settings.locale.datetime ?? 'en')
						.format?.(typeof dateFormat === 'string' ? dateFormat : 'ddd, MMMM D')} />

	{#if $settings[page].dateFormat === 'custom'}
		<div class="my-2 ml-6">
			<input
				type="text"
				spellcheck="false"
				class="block my-2"
				bind:value={$settings[page].dateFormatCustom} />
			<p>
				<b>{$dictionary.clockSettings['Preview:']}</b>
				{dayjs(now.value)
					.tz($settings.locale.timezone ?? 'Etc/GMT')
					.locale($settings.locale.datetime ?? 'en')
					.format?.($settings[page].dateFormatCustom)}
			</p>
		</div>
	{/if}
</div>

{#if $settings[page].dateFormat === 'custom' || $settings[page].timeFormat === 'custom'}
	<Button
		animation="flip-horizontal"
		icon="table"
		className="flex mb-4"
		onclick={() => open('datetime-format')}>
		{$dictionary.clockSettings['Custom formatting reference']}
	</Button>
{/if}

<Button
	animation="move-left"
	icon="undo"
	onclick={() => {
		for (const format of timeFormatSettings) {
			// @ts-ignore: defaultSettings formats are same type as settings formats
			$settings[page][format] = defaultSettings[page][format];
		}

		// copied from `_layout.svelte` since `timeFormat` will be null
		// because it's null in `defaultSettings` because it's overriden in `_layout.svelte` like so:
		if ($settings[page].timeFormat === null) {
			// https://stackoverflow.com/q/27647918/4907950
			const AMPM =
				Intl.DateTimeFormat(navigator.language, { hour: 'numeric' }).resolvedOptions().hourCycle ===
				'h12';
			$settings[page].timeFormat = AMPM ? 'h:mm A' : 'H:mm';
			$settings[page].timeFormatCustom = AMPM ? 'h:mm A' : 'H:mm';
		}
	}}>
	{$dictionary.clockSettings['Reset datetime formats']}
</Button>
