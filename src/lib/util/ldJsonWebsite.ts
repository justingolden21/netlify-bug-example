/**
 * Global ld+json for the website
 *
 * This applies to every page on the website
 */

import { appURL, supportedLangs } from '$lib/data/consts';

function ldJsonWebsite(appName: string) {
	return JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		'url': appURL,
		'name': appName,
		'datePublished': '2024-08-30T04:46:16.000Z', // new Date().toISOString()
		'inLanguage': supportedLangs
	});
}

export default ldJsonWebsite;
