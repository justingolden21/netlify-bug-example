<script lang="ts">
	import { onMount } from 'svelte';

	import AnalogClockThemeSettings from '$lib/components/features/analog/AnalogClockThemeSettings.svelte';
	import DatetimeFormatSettings from '$lib/components/features/settings/DatetimeFormatSettings.svelte';
	import SettingSelect from '$lib/components/features/settings/SettingSelect.svelte';
	import Accordion from '$lib/components/ui/Accordion.svelte';
	import AccordionPanel from '$lib/components/ui/AccordionPanel.svelte';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import { fontFamilies } from '$lib/data/consts';
	import { dictionary } from '$lib/stores/languageDictionary';
	import { settings } from '$lib/stores/settings';

	let batterySupported = $state(false);

	onMount(() => {
		batterySupported = navigator && 'getBattery' in navigator && !!navigator.getBattery;
	});
</script>

<Accordion key="1">
	<AccordionPanel accordionTitle={$dictionary.clockSettings['Displays']} key="1">
		<!-- @see displayOptions in util/toggleDisplay -->
		<div class="flex flex-wrap gap-4 lg:gap-6 mb-4">
			<SettingSelect
				id="primary-display-select"
				selectLabel={$dictionary.clockSettings['Primary display:']}
				bind:value={$settings.clock.displays.primary}
				values={['analog', 'time', 'date', 'datetime', 'text']}
				labels={$dictionary.clockSettings.clockFormats} />
			{#if $settings.clock.displays.primary !== 'analog'}
				<SettingSelect
					bind:value={$settings.clock.displays.primaryPalette}
					values={['base', 'accent']}
					labels={$dictionary.labels.palettes} />

				<SettingSelect
					bind:value={$settings.clock.displays.primaryFontSize}
					values={['small', 'medium', 'large', 'extralarge']}
					labels={$dictionary.clockSettings.sizes} />
			{/if}
		</div>

		<div class="flex flex-wrap gap-4 lg:gap-6 mb-4">
			<SettingSelect
				id="secondary-display-select"
				selectLabel={$dictionary.clockSettings['Secondary display:']}
				bind:value={$settings.clock.displays.secondary}
				values={['time', 'date', 'datetime', 'text', 'none']}
				labels={$dictionary.clockSettings.clockFormats} />

			{#if $settings.clock.displays.secondary !== 'none'}
				<SettingSelect
					bind:value={$settings.clock.displays.secondaryPalette}
					values={['base', 'accent']}
					labels={$dictionary.labels.palettes} />

				<SettingSelect
					bind:value={$settings.clock.displays.secondaryFontSize}
					values={['small', 'medium', 'large', 'extralarge']}
					labels={$dictionary.clockSettings.sizes} />
			{/if}
		</div>

		{#if $settings.clock.displays.secondary === 'text' || $settings.clock.displays.primary === 'text'}
			<label for="text-display-input" class="label mr-4">
				{$dictionary.labels['Custom text:']}
			</label>
			<textarea
				id="text-display-input"
				class="mb-4 w-full resize-none"
				maxlength="50"
				bind:value={$settings.clock.displays.text}></textarea>
		{/if}

		<!-- hide unless battery is supported and screen is large enough to show battery -->
		<div class="hidden mb-2 {batterySupported ? 'sm:block' : ''}">
			<Toggle
				id="show-battery-toggle"
				bind:checked={$settings.clock.displays.battery}
				labelText={$dictionary.clockSettings['Show battery']} />
		</div>
	</AccordionPanel>
	{#if $settings.clock.displays.primary == 'analog'}
		<AccordionPanel accordionTitle={$dictionary.clockSettings['Analog']} key="2">
			<AnalogClockThemeSettings page="clock" />
		</AccordionPanel>
	{/if}
	{#if $settings.clock.displays.primary != 'analog' || $settings.clock.displays.secondary != 'none'}
		<AccordionPanel accordionTitle={$dictionary.clockSettings['Digital Datetime']} key="3">
			<DatetimeFormatSettings page="clock" />

			{#if $settings.clock.displays.primary != 'analog' && fontFamilies[$settings.fontFamily].length > 1}
				<div class="mt-4">
					<SettingSelect
						id="datetime-font-weight-select"
						selectLabel={$dictionary.clockSettings['Primary display font weight:']}
						bind:value={$settings.clock.datetimeFontWeight}
						values={fontFamilies[$settings.fontFamily].map((s) => s.toString())}
						labelMapper={(weight) => {
							weight = typeof weight === 'string' ? parseInt(weight) : weight;
							return `${$dictionary.labels['Font Weights'][weight / 100]} (${weight / 100})`;
						}} />
				</div>
			{/if}
		</AccordionPanel>
	{/if}
</Accordion>
