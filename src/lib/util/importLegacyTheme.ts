import { get } from 'svelte/store';

import type { Settings } from '$lib/stores/settings';
import { userThemes, type Theme } from '$lib/stores/themes';
import { emptyTheme } from '$lib/themes';
import mergeDeep from '$lib/util/mergeSettings';
import uid from '$lib/util/uid';

// settings[page].theme -> settings.(world)?clock.theme.id
export function importLegacyTheme(settings: Settings) {
	// base clock
	if (typeof settings?.clock.themeID !== 'string') {
		if (settings.clock.theme) {
			console.log('importing legacy clock theme');
			const id = uid();
			const oldTheme = mergeDeep(JSON.parse(JSON.stringify(emptyTheme)), {
				...settings.clock.theme,
				id
			}) as Partial<Theme> & { id: string; name: string };
			userThemes.set([...get(userThemes), oldTheme]);
			settings.clock.themeID = id;
			delete settings.clock.theme;
		}
	}

	// worldclock
	if (typeof settings?.worldclock.themeID !== 'string') {
		if (settings.worldclock.theme) {
			console.log('importing legacy worldclock theme');
			const id = uid();
			const oldTheme = mergeDeep(JSON.parse(JSON.stringify(emptyTheme)), {
				...settings.worldclock.theme,
				id
			}) as Partial<Theme> & { id: string; name: string };
			userThemes.set([...get(userThemes), oldTheme]);
			settings.worldclock.themeID = id;
			delete settings.worldclock.theme;
		}
	}

	return settings;
}
