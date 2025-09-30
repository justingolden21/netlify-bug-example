import { get } from 'svelte/store';

import { settings } from '$lib/stores/settings';

/** get clock datetime format */
export default function getFormat(clock: 'clock' | 'worldclock', type: 'date' | 'time') {
	const $settings = get(settings);

	const defaultFormat = type === 'time' ? 'h:mm A' : 'ddd, MMMM D';
	return (
		$settings[clock][`${type}Format`] !== 'custom'
			? ($settings[clock][`${type}Format`] ?? defaultFormat)
			: $settings[clock][`${type}FormatCustom`] || defaultFormat
	)!;
}
