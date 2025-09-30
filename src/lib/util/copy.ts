import { addToast } from '$lib/components/ui/Toast.svelte';
import { appURL } from '$lib/data/consts';
import isTauri from '$lib/util/isTauri';

// NOTE: any because would be better to move to typesafe-i18n or alike rather than build own typesystem for i18n
export function copyURL(languageDictionary: any) {
	copyText(isTauri() ? appURL : window.location.href).then((success) => {
		const text = success
			? languageDictionary.messages['Copied successfully']
			: languageDictionary.messages['Failed to copy'];
		const icon = success ? 'success' : 'error';
		addToast({ text, icon });
	});
}

// Copies a string to clipboard
// Uses navigator API if available, else uses execCommand (deprecated)
// Returns a boolean if copy was successful
// See: https://stackoverflow.com/q/400212/4907950
export async function copyText(str: string) {
	console.log('Copying', str);
	if (!navigator.clipboard) {
		// fallback
		const input = document.createElement('textarea');
		input.innerHTML = str;
		document.body.appendChild(input);
		input.focus();
		input.select();
		let result;

		try {
			result = document.execCommand('copy');
			console.log('Fallback: Copying text command was ' + (result ? 'successful' : 'unsuccessful'));
		} catch (err) {
			console.error('Fallback: Could not copy text: ', err);
		}
		document.body.removeChild(input);
		return result;
	}
	const result = navigator.clipboard.writeText(str).then(
		function () {
			console.log('Async: Copying to clipboard was successful');
			return true;
		},
		function (err) {
			console.error('Async: Could not copy text: ', err);
			return false;
		}
	);
	return result;
}
