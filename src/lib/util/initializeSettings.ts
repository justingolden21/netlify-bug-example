import { get } from 'svelte/store';

import { settings } from '$lib/stores/settings';
import { defaultNightTheme, defaultTheme } from '$lib/themes';

/**
 * Initialize settings based on the user's device preferences.
 * Handles properties such as dark mode, language, and timezone.
 */
const initializeSettings = () => {
	const $settings = get(settings);

	// auto detect user device preferences
	if ($settings.darkMode === null) {
		$settings.darkMode = !!window.matchMedia('(prefers-color-scheme: dark)').matches;
		// if darkMode doesn't exist, the user doesn't already have theme settings, it's ok to step on the old theme
		if ($settings.darkMode) {
			$settings.clock.themeID = defaultNightTheme.id;
			$settings.worldclock.themeID = defaultNightTheme.id;
		} else {
			$settings.clock.themeID = defaultTheme.id;
			$settings.worldclock.themeID = defaultTheme.id;
		}
	}

	if ($settings.locale.timezone === null) {
		$settings.locale.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'Etc/GMT';
	}
	if ($settings.sunrise.timezone === null) {
		$settings.sunrise.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'Etc/GMT';
	}
	if ($settings.locale.language === null) {
		$settings.locale.language = window.navigator.language.substring(0, 2) ?? 'en';
	}
	if ($settings.locale.datetime === null) {
		$settings.locale.datetime =
			Intl.DateTimeFormat().resolvedOptions().locale.substring(0, 2) ?? 'en';
	}

	if ($settings.locale.metric === null) {
		/**
		 * Guess the user's unit preference (metric or us) based on their language
		 *
		 * Not an ideal system, but the best we get without complex logic such as geolocation
		 * The only countries that use USA units are USA, Liberia, and Myanmar
		 * USA and Liberia speak English and Myanmar speaks Burmese, which is also spoken in many countries that use metric
		 * `en-US`, `es-US`, `fr-US`, and `de-US` are all valid language codes that end in US
		 * Users can speak another language and still get assigned US units (if they specify they speak the US version)
		 * Users can speak English and get metric (`en-GB`, `en-CA`, `en-AU`, `en-IN`, `en-NZ`, `en-IE`, `en-ZA`, `en-SG`)
		 *
		 * This is just an educated guess and can easily be overriden by the user on pages where it is applied.
		 */
		$settings.locale.metric = !navigator.language.endsWith('US');
	}

	// https://stackoverflow.com/q/27647918/4907950
	const AMPM =
		Intl.DateTimeFormat(navigator.language, { hour: 'numeric' }).resolvedOptions().hourCycle ===
		'h12';
	if ($settings.clock.timeFormat === null) {
		$settings.clock.timeFormat = AMPM ? 'h:mm A' : 'H:mm';
		$settings.clock.timeFormatCustom = AMPM ? 'h:mm A' : 'H:mm';
	}
	if ($settings.worldclock.timeFormat === null) {
		$settings.worldclock.timeFormat = AMPM ? 'h:mm A' : 'H:mm';
		$settings.worldclock.timeFormatCustom = AMPM ? 'h:mm A' : 'H:mm';
	}
	if ($settings.worldclock.timetable.ampm === null) {
		$settings.worldclock.timetable.ampm = AMPM;
	}
	if ($settings.calendar.ampm === null) {
		$settings.calendar.ampm = AMPM;
	}
	settings.set($settings);
};

export default initializeSettings;
