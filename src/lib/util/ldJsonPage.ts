/**
 * Page specific ld+json
 *
 * This differs on a page by page basis
 */

function ldJsonPage(
	url: string,
	pageName: string,
	pageDescription: string,
	appName: string,
	appDescription: string,
	appFeatures: string[]
) {
	return JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'WebPage',
		'headline': pageName,
		'description': pageDescription,
		'url': url,
		'application': {
			'@type': 'SoftwareApplication',
			'name': appName,
			'description': appDescription,
			'features': appFeatures
		}
	});
}

export default ldJsonPage;
