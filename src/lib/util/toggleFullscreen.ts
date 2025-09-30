import Screenfull from 'screenfull';

import isTauri from '$lib/util/isTauri';

export default async function toggleFullscreen() {
	if (isTauri()) {
		// Toggle fullscreen in Tauri
		const { getCurrentWindow } = await import('@tauri-apps/api/window');
		const fullscreen = await getCurrentWindow().isFullscreen();
		await getCurrentWindow().setFullscreen(!fullscreen);
	} else if (Screenfull.isEnabled) {
		// Toggle fullscreen in a regular browser
		Screenfull.toggle();
	}
}
