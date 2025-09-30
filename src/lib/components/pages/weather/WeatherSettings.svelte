<script lang="ts">
	/**
	 * Settings component for `/weather` settings
	 */

	import SettingSelect from '$lib/components/features/settings/SettingSelect.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { dictionary } from '$lib/stores/languageDictionary';
	import { settings } from '$lib/stores/settings';
	import { open } from '$lib/util/modal.svelte';
	import nearestCity from '$lib/util/nearestCity';
	import validateInt from '$lib/util/validateInt';

	const round = (num: number) => Math.round(num * 100) / 100;

	const locationName = $derived(
		nearestCity($settings.weather.location.lat, $settings.weather.location.long)
	);
</script>

<div class="pad">
	<h3 class="h4 mb-2">{$dictionary.clockSettings['Displays']}</h3>

	<div class="mb-4">
		<SettingSelect
			id="primary-display-select"
			selectLabel={$dictionary.clockSettings['Primary display:']}
			bind:value={$settings.weather.displays.primary}
			values={['full', 'simple']}
			labels={$dictionary.clockSettings.clockFormats} />
	</div>

	<div class="mb-4">
		<SettingSelect
			id="secondary-display-select"
			selectLabel={$dictionary.clockSettings['Secondary display:']}
			bind:value={$settings.weather.displays.secondary}
			values={['daily_hourly', 'daily', 'hourly']}
			labels={$dictionary.clockSettings.clockFormats} />
	</div>

	<div>
		<label for="hourly-days-input" class="label">
			{$dictionary.labels['Days shown in hourly view:']}
		</label>

		<input
			id="hourly-days-input"
			type="number"
			min="1"
			max="6"
			oninput={(event) => {
				event.preventDefault();
				const value = validateInt(event.currentTarget);
				$settings.weather.hourlyDaysShown = value;
				event.currentTarget.value = String(value);
			}}
			value={$settings.weather.hourlyDaysShown} />
	</div>

	<hr class="my-10" />

	<p class="p mb-2">
		{round($settings.weather.location.lat)}&deg;, {round($settings.weather.location.long)}&deg;
		<br />
		{locationName}
	</p>

	<Button
		icon="pencil"
		animation="rotate-counter"
		onclick={() => open('sunrise-edit-location', { page: 'weather' })}>
		{$dictionary.sunriseSunsetSettings['Edit location']}
	</Button>

	<hr class="my-10" />

	<h3 class="h4 mb-2">{$dictionary.labels['Units']}</h3>

	<div class="flex flex-wrap gap-4">
		<Button
			className={$settings.locale.metric ? 'bg-accent-700' : ''}
			onclick={() => ($settings.locale.metric = true)}>
			{$dictionary.labels['Metric']}
		</Button>
		<Button
			className={!$settings.locale.metric ? 'bg-accent-700' : ''}
			onclick={() => ($settings.locale.metric = false)}>
			{$dictionary.labels['Imperial']}
		</Button>
	</div>
</div>
