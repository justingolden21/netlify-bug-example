<script lang="ts">
	import SettingSelect from '$lib/components/features/settings/SettingSelect.svelte';
	import type { SunProperty } from '$lib/components/pages/sunrise/Sunrise.svelte';
	import Accordion from '$lib/components/ui/Accordion.svelte';
	import AccordionPanel from '$lib/components/ui/AccordionPanel.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import { dictionary } from '$lib/stores/languageDictionary';
	import { defaultSettings, settings } from '$lib/stores/settings';
	import { open } from '$lib/util/modal.svelte';
	import { sunriseCurrentDateLocTimezone } from '$lib/util/sunriseCurrentDateLocTimezone';
	import validateInt from '$lib/util/validateInt';

	const sunProperties = [
		'sunrise',
		'sunriseEnd',
		'goldenHourEnd',
		'solarNoon',
		'goldenHour',
		'sunsetStart',
		'sunset',
		'dusk',
		'nauticalDusk',
		'night',
		'nadir',
		'nightEnd',
		'nauticalDawn',
		'dawn'
	] as SunProperty[];
</script>

<Accordion key="1">
	<AccordionPanel accordionTitle={$dictionary.clockSettings['Displays']} key="1">
		<!-- @see displayOptions in util/toggleDisplay -->
		<div class="mb-4">
			<SettingSelect
				id="primary-display-select"
				selectLabel={$dictionary.clockSettings['Primary display:']}
				bind:value={$settings.sunrise.displays.primary}
				values={['full', 'simple', 'none']}
				labels={$dictionary.clockSettings.clockFormats} />
		</div>

		<div>
			<SettingSelect
				id="secondary-display-select"
				selectLabel={$dictionary.clockSettings['Secondary display:']}
				bind:value={$settings.sunrise.displays.secondary}
				values={['full', 'simple', 'none']}
				labels={$dictionary.clockSettings.clockFormats} />
		</div>
	</AccordionPanel>

	<AccordionPanel
		accordionTitle={$dictionary.sunriseSunsetSettings['Date, Location, Timezone']}
		key="2">
		<!-- Same buttons at top section in `Sunrise.svelte` -->
		<div class="flex flex-wrap gap-4 lg:gap-6">
			<Button
				onclick={sunriseCurrentDateLocTimezone}
				icon="target"
				className="w-full"
				animation="zoom">
				{$dictionary.sunriseSunsetSettings['Use current date, location, and timezone']}
			</Button>
			<Button onclick={() => open('sunrise-edit-date')} icon="pencil" animation="rotate-counter">
				{$dictionary.sunriseSunsetSettings['Edit date']}
			</Button>
			<Button
				onclick={() => open('sunrise-edit-location', { page: 'sunrise' })}
				icon="pencil"
				animation="rotate-counter">
				{$dictionary.sunriseSunsetSettings['Edit location']}
			</Button>
			<Button
				onclick={() => open('sunrise-edit-timezone')}
				icon="pencil"
				animation="rotate-counter">
				{$dictionary.sunriseSunsetSettings['Edit timezone']}
			</Button>
		</div>
	</AccordionPanel>

	<AccordionPanel accordionTitle={$dictionary.sunriseSunsetSettings['Sun Table']} key="3">
		<Toggle
			id="show-sun-table-toggle"
			bind:checked={$settings.sunrise.table.show}
			labelText={$dictionary.sunriseSunsetSettings['Show sun table']} />

		{#if $settings.sunrise.table.show}
			<div class="mt-2">
				<label for="sunrise-table-rows-input" class="label">
					{$dictionary.sunriseSunsetSettings['Number of rows:']}
				</label>
				<input
					id="sunrise-table-rows-input"
					oninput={(event) => {
						event.preventDefault();
						const value = validateInt(event.currentTarget);
						$settings.sunrise.table.rows = value;
						event.currentTarget.value = String(value);
					}}
					value={$settings.sunrise.table.rows}
					type="number"
					min="1"
					max="20" />
			</div>

			<h3 class="h4 mt-6 mb-2">
				{$dictionary.sunriseSunsetSettings['Properties to display:']}
			</h3>
			{#each sunProperties as sunProperty}
				<Toggle
					id="show-sun-table-{sunProperty}-toggle"
					labelText={$dictionary.sunriseSunsetSettings.sunProperties[sunProperty]}
					checked={$settings.sunrise.table.cols.includes(sunProperty)}
					onchange={() => {
						// Add to array if not present, else remove from array
						// Note: order in array doesn't matter
						if (!$settings.sunrise.table.cols.includes(sunProperty)) {
							$settings.sunrise.table.cols.push(sunProperty);
						} else {
							// prettier-ignore
							$settings.sunrise.table.cols.splice($settings.sunrise.table.cols.indexOf(sunProperty), 1);
						}
						$settings.sunrise.table.cols = $settings.sunrise.table.cols;
					}} />
			{/each}
		{/if}
	</AccordionPanel>
</Accordion>

<div class="pad">
	<Button
		onclick={() => {
			// Keep user location settings (so we don't bug them again)
			const userLocation = JSON.parse(JSON.stringify($settings.sunrise.location));
			$settings.sunrise = JSON.parse(JSON.stringify(defaultSettings.sunrise));
			$settings.sunrise.location = userLocation;
		}}
		icon="undo"
		animation="move-left">
		{$dictionary.sunriseSunsetSettings['Reset sunrise sunset settings']}
	</Button>
</div>
