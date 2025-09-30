import { addToast } from '$lib/components/ui/Toast.svelte';

/**
 * If too many stopwatches, create a toast and return true; otherwise return false
 * @param {object} dictionary language dictionary
 * @param {number} currentNum current number of stopwatches
 * @param {number} addingNum number of new stopwatches to create
 * @param {number} max maximum number of stopwatches
 * @example
 * ```
 * const tooMany = checkTooManyStopwatches(dictionary, $settings.stopwatch.stopwatches.length, 1);
 * if (tooMany) return;
 * ```
 * @returns {boolean} true if the stopwatch limit is exceeded, otherwise false
 */
// NOTE: any because would be better to move to typesafe-i18n or alike rather than build own typesystem for i18n
const checkTooManyStopwatches = (
	dictionary: any,
	currentNum: number,
	addingNum: number,
	max: number = 100
) => {
	if (currentNum + addingNum > max) {
		const text = dictionary.messages['Too many stopwatches'];
		const icon = 'error';
		addToast({ text, icon });
		return true;
	}

	return false;
};

export default checkTooManyStopwatches;
