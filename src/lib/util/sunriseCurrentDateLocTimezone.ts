/**
 * Reset sunrise date, location, and timezone settings
 *
 * Similar code to that present in `SunriseEditDateModal`, `SunriseEditLocationModal`, and `SunriseEditTimezoneModal`
 */

import { get } from 'svelte/store';

import { settings } from '$lib/stores/settings';
import nearestCity from '$lib/util/nearestCity';

export function sunriseCurrentDateLocTimezone() {
	const $settings = get(settings);

	// Date
	$settings.sunrise.date = -1;

	// Timezone
	$settings.sunrise.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

	// Location
	// if unsupported or error, doesn't change setting
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition((position) => {
			// Store user's location
			$settings.sunrise.location = {
				lat: position.coords.latitude,
				long: position.coords.longitude,
				name: ''
			};

			$settings.sunrise.location.name = nearestCity(
				$settings.sunrise.location.lat,
				$settings.sunrise.location.long
			);

			// We must set the store here too since it's async
			settings.set($settings);
		});
	}

	settings.set($settings);
}
