// Contains state `$isFullscreen` and a listener `onFullscreenChange`

import { browser } from '$app/environment';
import Screenfull from 'screenfull';

let isFullscreenState = $state(false);

if (browser && Screenfull.isEnabled) {
	isFullscreenState = Screenfull.isFullscreen;
	Screenfull.on('change', () => {
		isFullscreenState = Screenfull.isFullscreen;
	});
}

export const isFullscreen = {
	get value() {
		return isFullscreenState;
	}
};

export const onFullscreenChange = (func: (b: boolean) => any) => {
	if (!Screenfull.isEnabled) return;

	Screenfull.on('change', () => func(Screenfull.isFullscreen));
};
