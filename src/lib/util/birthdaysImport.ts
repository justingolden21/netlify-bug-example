/**
 * Utility function for importing birthdays from an encoded string
 */

import { get } from 'svelte/store';

import { addToast } from '$lib/components/ui/Toast.svelte';
import { dictionary } from '$lib/stores/languageDictionary';
import { settings } from '$lib/stores/settings';
import { decodeBirthdays, mergeBirthdays } from '$lib/util/birthdaysTranscoder';

function birthdaysImport(importText: string) {
	const $settings = get(settings);
	const $dictionary = get(dictionary);

	try {
		const numPrev = $settings.birthdays.birthdays.length;
		$settings.birthdays.birthdays = mergeBirthdays(
			decodeBirthdays(importText),
			$settings.birthdays.birthdays
		);
		const numCur = $settings.birthdays.birthdays.length;
		const numImported = numCur - numPrev;
		const success = numCur <= 2000 && numImported > 0;

		let text: string;
		if (success) {
			if (numImported === 1) {
				text = $dictionary.messages['Imported 1 item'].replace('{1}', numImported);
			} else {
				text = $dictionary.messages['Imported x items'].replace('{1}', numImported);
			}
			importText = '';
		} else {
			if (numImported === 0) {
				text = $dictionary.messages['Imported x items'].replace('{1}', numImported);
			} else {
				text = $dictionary.messages['Too many birthdays'];
			}
		}
		const icon = success ? 'success' : 'error';
		addToast({ text, icon });

		settings.set($settings);
		dictionary.set($dictionary);
		return success;
	} catch (err) {
		console.error('Error importing:', err);
		const text = $dictionary.messages['Failed to import'];
		const icon = 'error';
		addToast({ text, icon });
		return false;
	}
}

export default birthdaysImport;
