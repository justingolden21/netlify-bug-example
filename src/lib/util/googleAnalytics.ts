import { settings } from '$lib/stores/settings';
import { get } from 'svelte/store';

function sendAnalytics() {
	const $settings = get(settings);

	if (typeof gtag !== 'undefined' && document.location.hostname.search('desktopclock.app') !== -1) {
		gtag('event', 'page-load-settings', {
			non_interaction: true,
			dark_mode: $settings.darkMode,
			timezone: $settings.locale.timezone,
			language: $settings.locale.language,
			datetime_locale: $settings.locale.datetime,
			time_format: $settings.clock.timeFormat,
			navigator_language: navigator.language,
			font_family: $settings.fontFamily,
			font_family_body: $settings.fontFamilyBody
		});

		gtag('event', 'pwa-install', {
			display_mode: window.matchMedia('(display-mode: standalone)').matches
				? 'standalone'
				: 'browser'
		});
	}
}

export default sendAnalytics;
