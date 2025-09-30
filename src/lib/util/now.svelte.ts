/**
 * Global date variable used throughout the app
 */

import { browser } from '$app/environment';

/**
 * Creates a reactive `Date` value that updates on a timer.
 * When the tab is hidden, the update interval slows to reduce CPU usage.
 *
 * @param interval Update frequency in milliseconds while the tab is visible
 */
function createNow(interval: number = 50) {
	let state = $state(new Date());
	let timer: ReturnType<typeof setInterval>;

	// Updating the state every `delay` milliseconds
	const start = (delay: number) => {
		timer = setInterval(() => {
			state = new Date();
		}, delay);
	};

	if (browser) {
		start(interval);

		// Slow the timer when the document is hidden to save resources
		document.addEventListener('visibilitychange', () => {
			clearInterval(timer);
			start(document.hidden ? 1000 : interval);
		});
	}

	return {
		get value() {
			return state;
		},
		update() {
			state = new Date();
		}
	};
}

const now = createNow();

export { now };
