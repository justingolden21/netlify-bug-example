<script lang="ts">
	import { getKeys } from '$/types';
	import Autocomplete from '$lib/components/ui/Autocomplete.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import cityPositions from '$lib/data/cityPositions.json';
	import { dictionary } from '$lib/stores/languageDictionary';
	import { settings } from '$lib/stores/settings';
	import nearestCity from '$lib/util/nearestCity';
	import { validateFloat } from '$lib/util/validateInt';

	// Modal data - which page we edit location settings for
	interface Props {
		data: { page: 'sunrise' | 'weather' };
	}

	let { data = $bindable() }: Props = $props();

	// Updated and rendered below as a key of `dictionary.sunriseSunsetSettings.locationStatus`
	let status = $state('');

	// https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API/Using_the_Geolocation_API
	function getLocation() {
		if (!navigator.geolocation) {
			status = 'Geolocation is not supported by your browser';
		} else {
			status = 'Locating...';
			navigator.geolocation.getCurrentPosition(
				(position) => {
					// success
					status = 'Located successfully';

					const latitude = position.coords.latitude;
					const longitude = position.coords.longitude;

					$settings[data.page].location.lat = latitude;
					$settings[data.page].location.long = longitude;
					$settings[data.page].location.name = '';

					status = '';
				},
				() => {
					// error
					status = 'Unable to retrieve your location';
				}
			);
		}
	}

	// Automatic location name using `nearestCity`
	$effect(() => {
		const { lat, long } = $settings[data.page].location;
		if (lat && long) {
			const newName = nearestCity(lat, long);

			// Only update the name if it's actually different
			if ($settings[data.page].location.name !== newName) {
				$settings[data.page].location.name = newName;
			}
		}
	});

	function setLocationToCity(city: keyof typeof cityPositions) {
		$settings[data.page].location.lat = cityPositions[city][0];
		$settings[data.page].location.long = cityPositions[city][1];
		$settings[data.page].location.name = city;
	}

	let showAutocomplete = $state(false);
</script>

<div class="pad">
	<Button
		variant="ghost"
		className={showAutocomplete ? 'px-0' : ''}
		onclick={() => (showAutocomplete = true)}
		onClickOutside={() => (showAutocomplete = false)}>
		{#if showAutocomplete}
			<Autocomplete
				id="city-position-autocomplete"
				title={$dictionary.sunriseSunsetSettings['useCityLatLong']}
				value={''}
				options={getKeys(cityPositions)}
				onchange={setLocationToCity}
				maxResults={100}
				displayPreview={false}
				selectOnFocus={true}
				selectOnClick={true} />
		{:else}
			<!-- 6px to prevent layout shift -->
			<p class="p p-[6px]">
				<Icon name="pencil" size="sm" className="mr-1" />
				{$settings[data.page].location.name}
			</p>
		{/if}
	</Button>

	<div class="flex gap-4 my-4">
		<p class="p mt-2">
			<input
				aria-label={$dictionary.sunriseSunsetSettings['Latitude:']}
				type="number"
				onblur={(event) => {
					event.preventDefault();
					const value = validateFloat(event.currentTarget);
					$settings[data.page].location.lat = value;
					event.currentTarget.value = String(value);
				}}
				value={$settings[data.page].location.lat}
				min="-90"
				max="90"
				step="0.1" />
			&deg;
		</p>

		<p class="p mt-2">
			<input
				aria-label={$dictionary.sunriseSunsetSettings['Longitude:']}
				type="number"
				onblur={(event) => {
					event.preventDefault();
					const value = validateFloat(event.currentTarget);
					$settings[data.page].location.long = value;
					event.currentTarget.value = String(value);
				}}
				value={$settings[data.page].location.long}
				min="-180"
				max="180"
				step="0.1" />
			&deg;
		</p>
	</div>

	<hr class="my-4" />

	<Button icon="target" animation="zoom" onclick={getLocation}>
		{$dictionary.sunriseSunsetSettings['Use current location']}
	</Button>

	{#if status !== ''}
		<p class="p-sm mt-2">
			{$dictionary.sunriseSunsetSettings.locationStatus[status]}
		</p>
	{/if}
</div>
