import { addToast } from '$lib/components/ui/Toast.svelte';

/**
 * If too many events, create a toast and return true; otherwise return false
 * @param dictionary language dictionary
 * @param currentNum current number of events
 * @param addingNum number of new events to create
 * @param max maximum number of events
 * @example
 * ```
 * const tooMany = checkTooManyEvents(dictionary, $settings.calendar.events.length, 1);
 * if (tooMany) return;
 * ```
 * @returns {boolean} true if the event limit is exceeded, otherwise false
 */
const checkTooManyEvents = (
	dictionary: any,
	currentNum: number,
	addingNum: number,
	max: number = 1000
) => {
	if (currentNum + addingNum > max) {
		const text = dictionary.messages['Too many events'];
		const icon = 'error';
		addToast({ text, icon });
		return true;
	}

	return false;
};

export default checkTooManyEvents;
