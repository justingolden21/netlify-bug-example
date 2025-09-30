// Creates a store that is tied to (reads and updates) localStorage

import { writable } from 'svelte/store';

import mergeDeep from '$lib/util/mergeSettings';

function localStore<T extends MaybeArray<Record<string, unknown>>>(
	key: string,
	defaultValue: T,
	doMerge: boolean = false
) {
	const store = writable(defaultValue);

	function getValue() {
		let value;
		const lsVal = localStorage.getItem(key);
		if (lsVal && doMerge && !Array.isArray(defaultValue)) {
			value = mergeDeep(defaultValue, JSON.parse(lsVal));
		} else if (lsVal) {
			value = JSON.parse(lsVal);
		} else {
			value = defaultValue;
		}
		if (value !== null) store.set(value);
	}

	if (typeof localStorage !== 'undefined') {
		getValue();

		// Keeps data in sync in case user has multiple tabs of the website open
		window.addEventListener('storage', getValue);

		store.subscribe((val) => {
			localStorage.setItem(key, JSON.stringify(val));
		});
	}

	return store;
}

export default localStore;
