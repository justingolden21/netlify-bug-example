<script module lang="ts">
	// todo: move to util/ and change from page to window.location.pathname
	// todo: search for activeElement and make one function here for isActiveElementFocusable that's reused across app
	// runs keyboard shortcut logic and exports list of keyboard shortcuts
	// cannot import session here
	// workaround: these are keys in the dictionary to be used where the shortcuts list is used
	export const keyboardShortcutsList = {
		N: 'Toggle dark mode',
		S: 'Settings',
		F: 'Toggle fullscreen',
		B: 'Toggle battery display',
		P: 'Toggle primary display',
		D: 'Toggle secondary display'
	} as const;
</script>

<script lang="ts">
	import { page } from '$app/state';

	import { settings } from '$lib/stores/settings';
	import { isModalOpen, toggle } from '$lib/util/modal.svelte';
	import ToggleDisplay from '$lib/util/toggleDisplay';
	import toggleFullscreen from '$lib/util/toggleFullscreen';
</script>

<svelte:window
	onkeydown={(event) => {
		/**
		 * Return if:
		 * - keyboard shortcuts setting is not enabled
		 * - the active element is an input the user can type in
		 * - an excluded modal is open
		 * - ctrl key is down (we don't want ctrl+f triggering fullscreen for example)
		 */
		if (
			!$settings.keyboardShortcuts ||
			['input', 'textarea', 'select'].includes(
				document.activeElement?.tagName.toLowerCase() ?? ''
			) ||
			isModalOpen('rubiks-interactable-cube') ||
			event.ctrlKey
		)
			return;

		if (event.code === 'KeyN') {
			$settings.darkMode = !$settings.darkMode;
			$settings.pitchBlackMode = false;
			$settings.dayNightMode = false;
		}
		if (event.code === 'KeyS') {
			toggle('settings');
		}
		if (event.code === 'KeyF') {
			toggleFullscreen();
		}
		if (event.code === 'KeyB') {
			if (page.url.pathname === '/') {
				$settings.clock.displays.battery = !$settings.clock.displays.battery;
			}
		}
		if (event.code === 'KeyD') {
			ToggleDisplay(page, settings, 'secondary');
		}
		if (event.code === 'KeyP') {
			ToggleDisplay(page, settings, 'primary');
		}

		// TODO: keyT to toggle themes?
	}} />
