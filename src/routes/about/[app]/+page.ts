// Throw 404 if invalid about page, else returns `slug` for `+page.svelte`

import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

import { appNames } from '$lib/data/consts';

export const load: PageLoad = async (event) => {
	const slug = event.params.app as string;
	if (![...appNames, 'app', 'goals', 'time', 'dates'].includes(slug)) {
		throw error(404, 'Page not found');
	}
	return { slug };
};
