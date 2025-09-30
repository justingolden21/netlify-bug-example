import type { Handle } from '@sveltejs/kit';

export const handle = (async ({ event, resolve }) => {
	// Default to English for initial page load, ensuring the app functions and SEO is effective.
	// Only send SEO data (`appName`, `seo`, `features`) in English, then on load, full language for user's language will be loaded.
	event.locals.languageDictionary = await event
		.fetch('/lang/en.json')
		.then((res) => res.json().then(({ appName, seo, features }) => ({ appName, seo, features })));
	return resolve(event);
}) satisfies Handle;
