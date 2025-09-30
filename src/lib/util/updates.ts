// Unused for now

import { goto } from '$app/navigation';
import { get } from 'svelte/store';

import { addToast } from '$lib/components/ui/Toast.svelte';
import { isMajorChange } from '$lib/stores/isMajorChange';
import { close } from '$lib/util/modal.svelte';

// NOTE: `any` because would be better to move to typesafe-i18n or alike rather than build own typesystem for i18n
function updateToast(sw: ServiceWorker, session: any) {
	return addToast({
		text: session.languageDictionary.update['Update available'],
		duration: Infinity,
		dismissible: true,
		icon: 'info',
		buttons: [
			{
				label: session.languageDictionary.update['Update'],
				dismiss: true,
				action: () => {
					sw.postMessage('SKIP_WAITING');
					// open('changelog'); // TODO: fix this modal
					addToast({
						text: session.languageDictionary.update['Update successful']
					});
				}
			},
			{
				label: session.languageDictionary.update["What's new"],
				dismiss: false,
				action: () => {
					goto('/changelog');
					close();
				}
			}
		]
	});
}

function doUpdate(sw: ServiceWorker, session: any) {
	if (get(isMajorChange)) {
		return updateToast(sw, session);
	}

	sw.postMessage('SKIP_WAITING');
}

export async function checkUpdates(session: any) {
	let dismiss: (() => void) | undefined = undefined;
	const registration = await window.navigator.serviceWorker.getRegistration();
	if (!registration) return;

	/* WAITING */
	if (registration.waiting) dismiss = doUpdate(registration.waiting, session);

	/* INSTALLING */
	if (registration.installing) {
		if (dismiss) {
			dismiss();
			dismiss = undefined;
		}
		registration.installing.addEventListener(
			'statechange',
			() =>
				registration.waiting &&
				navigator.serviceWorker.controller &&
				doUpdate(registration.waiting, session)
		);

		return;
	}

	registration.addEventListener('updatefound', () => {
		if (!registration.installing) return;

		registration.installing.addEventListener(
			'statechange',
			() =>
				registration.waiting &&
				navigator.serviceWorker.controller &&
				doUpdate(registration.waiting, session)
		);

		return;
	});
}
