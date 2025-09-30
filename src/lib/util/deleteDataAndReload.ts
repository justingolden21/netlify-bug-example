// Clears local storage and refreshes page

import { defaultSettings, settings } from '$lib/stores/settings';
import { userThemes } from '$lib/stores/themes';
import initializeSettings from '$lib/util/initializeSettings';

export default async function deleteDataAndReload() {
	/**
	 * Reset store values. We do this instead of `localStorage.clear()`
	 * because intervals might set local storage between clearing and reloading
	 */
	settings.set(JSON.parse(JSON.stringify(defaultSettings)));
	initializeSettings();
	userThemes.set([]);
	location.reload();
}
