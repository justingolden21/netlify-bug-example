// Utilities for casting the current page to another screen / TV

import { browser } from '$app/environment';

// https://googlechrome.github.io/samples/presentation-api/
// https://googlechrome.github.io/samples/presentation-api/receiver/

// TODO: On leave clear the presentation request so no error upon refresh?

// NOTE: Monkey Patching window with any because typescript doesn't yet natively support cast API
let presentationRequest: any;

// Return `true` if the browser supports casting, else `false`
const isCastSupported = (
	window: any
): window is { PresentationRequest: any; navigator: Navigator & { presentation: any } } =>
	'PresentationRequest' in (window ?? {});

// Prepare presentation request, called `onMount`
function setupCasting() {
	if (!browser) return;
	if (!isCastSupported(window)) return;

	// in quotes is url location of receiver page, for example, "receiver/index.html"
	presentationRequest = new window.PresentationRequest(['']);

	// Make this presentation the default one when using the "Cast" browser menu.
	window.navigator.presentation.defaultRequest = presentationRequest;
}

// Attempt to cast current page, called on button click
function castClock() {
	if (!browser) return;
	if (!isCastSupported(window)) {
		console.log('Not supported');
		return;
	}

	console.log('Starting presentation request...');
	presentationRequest
		.start()
		.then((connection: any) => {
			console.log(`Connected to ${connection.url}, id: ${connection.id}`);
		})
		.catch((error: any) => {
			console.log(`${error.name}: ${error.message}`);
		});
}

export { castClock, isCastSupported, setupCasting };
