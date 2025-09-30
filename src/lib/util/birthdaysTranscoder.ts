/**
 * Utility functions for encoding, decoding, and merging birthdays
 */

import lz from 'lz-string';

import type { BirthdayItem } from '$lib/components/pages/birthdays/Birthdays.svelte';

const encodeBirthdays = (birthdays: BirthdayItem[]) =>
	lz.compressToBase64(JSON.stringify(birthdays));

const decodeBirthdays = (encoded: string) =>
	JSON.parse(lz.decompressFromBase64(encoded)) as BirthdayItem[];

/**
 * Merges incoming birthdays with existing ones
 * If an ID overlaps, the existing birthday is retained.
 */
function mergeBirthdays(incomingBirthdays: BirthdayItem[], existingBirthdays: BirthdayItem[]) {
	// Create Set of existing IDs
	const existingIds = new Set(existingBirthdays.map((b) => b.id));

	// Filter incoming birthdays to exclude any that share an ID with existing birthdays
	const newBirthdays = incomingBirthdays.filter((birthday) => !existingIds.has(birthday.id));

	// Return the existing birthdays combined with new ones
	return [...existingBirthdays, ...newBirthdays];
}

export { decodeBirthdays, encodeBirthdays, mergeBirthdays };
