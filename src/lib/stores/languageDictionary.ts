/**
 * Languge dictionary store used throughout the app to get translated strings
 *
 * The store is set initially in `+layout.svelte` and then updated in `changeLanguage` inside `SettingsPanelGeneral.svelte`
 */

import { writable } from 'svelte/store';

export const dictionary = writable<Record<string, any>>();
export const dictionaryAbout = writable<Record<string, any>>();
