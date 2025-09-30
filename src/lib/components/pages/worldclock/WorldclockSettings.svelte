<script module lang="ts">
	export const defaultTimezones = [
		'America/Los_Angeles',
		'America/New_York',
		'Europe/London',
		'Europe/Paris',
		'Asia/Hong_Kong',
		'Asia/Tokyo'
	].map((zone) => ({ name: '', zone }));

	export const defaultExtendedTimezones = [
		'America/Los_Angeles',
		'America/Chicago',
		'America/New_York',
		'America/Sao_Paulo',
		'Europe/London',
		'Europe/Paris',
		'Africa/Johannesburg',
		'Europe/Moscow',
		'Asia/Kolkata',
		'Asia/Hong_Kong',
		'Asia/Tokyo',
		'Australia/Sydney'
	].map((zone) => ({ name: '', zone }));
</script>

<script lang="ts">
	import AnalogClockThemeSettings from '$lib/components/features/analog/AnalogClockThemeSettings.svelte';
	import DatetimeFormatSettings from '$lib/components/features/settings/DatetimeFormatSettings.svelte';
	import SettingSelect from '$lib/components/features/settings/SettingSelect.svelte';
	import Accordion from '$lib/components/ui/Accordion.svelte';
	import AccordionPanel from '$lib/components/ui/AccordionPanel.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { dictionary } from '$lib/stores/languageDictionary';
	import { defaultSettings, settings } from '$lib/stores/settings';
	import { defaultNightTheme, defaultTheme } from '$lib/themes';
</script>

<Accordion key="1">
	<AccordionPanel accordionTitle={$dictionary.clockSettings['Displays']} key="1">
		<!-- @see displayOptions in util/toggleDisplay -->
		<div class="mb-4">
			<SettingSelect
				id="primary-display-select"
				selectLabel={$dictionary.clockSettings['Primary display:']}
				bind:value={$settings.worldclock.displays.primary}
				values={['analog_digital', 'digital', 'none']}
				labels={$dictionary.clockSettings.clockFormats} />
		</div>

		<div>
			<SettingSelect
				id="secondary-display-select"
				selectLabel={$dictionary.clockSettings['Secondary display:']}
				bind:value={$settings.worldclock.displays.secondary}
				values={['rows', 'compact_rows', 'analog_grid', 'digital_grid']}
				labels={$dictionary.clockSettings.clockFormats} />
		</div>
	</AccordionPanel>

	{#if $settings.worldclock.displays.primary === 'analog_digital' || $settings.worldclock.displays.secondary !== 'digital_grid'}
		<AccordionPanel accordionTitle={$dictionary.clockSettings['Analog']} key="2">
			<AnalogClockThemeSettings page="worldclock" />
		</AccordionPanel>
	{/if}

	<AccordionPanel accordionTitle={$dictionary.clockSettings['Digital Datetime']} key="3">
		<DatetimeFormatSettings page="worldclock" />
	</AccordionPanel>
</Accordion>

<div class="pad flex flex-wrap gap-4 lg:gap-6">
	<Button
		icon="undo"
		animation="move-left"
		onclick={() => ($settings.worldclock.timezones = [...defaultTimezones])}>
		{$dictionary.worldclockSettings['Set default timezones']}
	</Button>

	<Button
		icon="undo"
		animation="move-left"
		onclick={() => ($settings.worldclock.timezones = [...defaultExtendedTimezones])}>
		{$dictionary.worldclockSettings['Set extended default timezones']}
	</Button>

	<Button
		icon="trash"
		animation="rotate-clock-sm"
		onclick={() => {
			$settings.worldclock.timezones = [];
		}}>
		{$dictionary.worldclockSettings['Delete worldclocks']}
	</Button>

	<Button
		icon="undo"
		animation="move-left"
		onclick={() => {
			const userWorldclocks = JSON.parse(JSON.stringify($settings.worldclock.timezones));
			$settings.worldclock = JSON.parse(JSON.stringify(defaultSettings.worldclock));
			$settings.worldclock.timezones = userWorldclocks;

			// Set null settings to browser defaults for AMPM and dark mode
			// TODO: move into centralized location
			// copied from `initializeSettings.ts`

			const AMPM =
				Intl.DateTimeFormat(navigator.language, { hour: 'numeric' }).resolvedOptions().hourCycle ===
				'h12';
			$settings.worldclock.timeFormat = AMPM ? 'h:mm A' : 'H:mm';
			$settings.worldclock.timeFormatCustom = AMPM ? 'h:mm A' : 'H:mm';
			$settings.worldclock.timetable.ampm = AMPM;

			const isDark = !!window.matchMedia('(prefers-color-scheme: dark)').matches;
			if (isDark) {
				$settings.clock.themeID = defaultNightTheme.id;
				$settings.worldclock.themeID = defaultNightTheme.id;
			} else {
				$settings.clock.themeID = defaultTheme.id;
				$settings.worldclock.themeID = defaultTheme.id;
			}
		}}>
		{$dictionary.worldclockSettings['Reset worldclock settings']}
	</Button>
</div>
