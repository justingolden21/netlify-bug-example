import { addToast } from '$lib/components/ui/Toast.svelte';
import checkTooManyEvents from '$lib/util/checkTooManyEvents';
import type { CalendarEvent } from '$lib/util/eventManager';
import { open } from '$lib/util/modal.svelte';

/**
 * Remove a single event and display a toast.
 */
export function deleteEvent(
	dictionary: any,
	events: CalendarEvent[],
	eventId: string
): CalendarEvent[] {
	const updated = events.filter((event) => event.id !== eventId);
	addToast({ text: dictionary.messages['Deleted successfully'], icon: 'trash' });
	return updated;
}

/**
 * Delete all events and display a toast.
 */
export function deleteAllEvents(dictionary: any): CalendarEvent[] {
	addToast({ text: dictionary.messages['Deleted successfully'], icon: 'trash' });
	return [];
}

/**
 * Open the new event modal if not exceeding the event limit.
 *
 * @param dictionary language dictionary
 * @param currentNum current number of calendar events
 * @param data optional modal data passed to the new event modal
 * @returns {boolean} true if the modal opened, false if the event limit was exceeded
 */
export function openNewEvent(
	dictionary: any,
	currentNum: number,
	data?: Record<string, unknown>
): boolean {
	const tooMany = checkTooManyEvents(dictionary, currentNum, 1);
	if (tooMany) return false;
	open('new-event-modal', data);
	return true;
}
