import { getEntries, getKeys } from '$/types';
import { goto } from '$app/navigation';
import { get } from 'svelte/store';

import { addToast } from '$lib/components/ui/Toast.svelte';
import { settings } from '$lib/stores/settings';
import { userThemes, type Theme } from '$lib/stores/themes';
import { emptyTheme } from '$lib/themes';
import mergeDeep from '$lib/util/mergeSettings';
import { difference } from '$lib/util/objectDifference';
import { decodeTheme } from '$lib/util/themeTranscoder';
import uid from '$lib/util/uid';

export function getMinTheme(themeParam: any) {
	// deep clone so we don't mutate original theme
	const theme = JSON.parse(JSON.stringify(themeParam));

	/**
	 * In addition to using `difference`, we delete specific keys that depend on each other.
	 * For example, a red stroke of width 0 or a transparent stroke of width 3 can both be deleted
	 * since there is no reason to store the color if the width is 0 and there is no reason to store the width if the color is transparent
	 */

	// hands
	const hands = theme.hands as Theme['hands'];
	for (const key of getKeys(hands)) {
		if (key === 'secondHandMovement') {
			continue;
		}

		const value = hands[key];
		if (value?.stroke?.lightness === '-1') {
			delete theme.hands[key];
		} else if (value.strokeWidth === 0) {
			delete theme.hands[key];
		}
	}

	// shadow
	if (theme?.shadow?.fill?.lightness === '-1') {
		delete theme.shadow;
	}

	// face
	if (theme?.face?.fill?.lightness === '-1') {
		delete theme.face.fill;
	} else if (theme?.face?.stroke?.lightness === '-1') {
		delete theme.face.stroke;
		delete theme.face.strokeWidth;
	} else if (theme?.face?.strokeWidth === 0) {
		delete theme.face.stroke;
		delete theme.face.strokeWidth;
	}

	// pins
	if (theme?.pin?.fill?.lightness === '-1') {
		delete theme.pin.fill;
	} else if (theme?.pin?.stroke?.lightness === '-1') {
		delete theme.pin.stroke;
		delete theme.pin.strokeWidth;
	} else if (theme?.pin?.strokeWidth === 0) {
		delete theme.pin.stroke;
		delete theme.pin.strokeWidth;
	}
	if (theme?.pin?.size === 0) {
		theme.pin = {};
	}

	// numerals
	if (theme?.numerals?.style === 'none') {
		theme.numerals = {};
	}
	if (theme?.numerals?.fill?.lightness === '-1') {
		theme.numerals = {};
	}

	// ticks
	for (const [key, value] of getEntries(theme.ticks as Theme['ticks'])) {
		if (value?.stroke?.lightness === '-1') {
			delete theme.ticks?.[key];
		} else if (value.height === 0) {
			delete theme.ticks?.[key];
		} else if (value.width === 0) {
			delete theme.ticks?.[key];
		}
	}

	return difference(JSON.parse(JSON.stringify(emptyTheme)), theme);
}

export function setThemeFromURL(
	pagename: 'clock' | 'worldclock',
	url: URL,
	languageDictionary: any
) {
	if (get(userThemes).length >= 10) {
		const text =
			languageDictionary.messages[
				'You can save at most 10 custom themes. Remove some to add more.'
			];
		const icon = 'error';
		addToast({ text, icon });
		return;
	}

	try {
		const themeString = url.searchParams.get('theme');
		if (themeString) {
			const theme = mergeDeep(
				JSON.parse(JSON.stringify(emptyTheme)),
				decodeTheme(themeString)
			) as Partial<Theme> & { id: string; name: string };
			theme.id = uid();
			settings.update(($settings) => {
				$settings[pagename].themeID = theme.id;
				userThemes.update((themes) => [theme, ...themes]);
				return $settings;
			});
		}

		url.searchParams.delete('theme');

		goto(url.toString());

		addToast({
			text: languageDictionary.messages['Theme imported successfully'],
			icon: 'success'
		});
	} catch (err) {
		console.log(err);
		console.error('invalid theme');
		addToast({
			text: languageDictionary.messages['Error importing theme'],
			icon: 'error'
		});
	}
}
