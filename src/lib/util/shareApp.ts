import { appURL, validPages } from '$lib/data/consts';

// NOTE: any because would be better to move to typesafe-i18n or alike rather than build own typesystem for i18n
export default function shareApp(languageDictionary: Record<string, any>, pathname: string) {
	if (!navigator.share) return;

	if (!validPages.includes(pathname as any)) {
		shareApp(languageDictionary, '/');
	}

	if (pathname.startsWith('/about/')) {
		const pageName = pathname.substring(7);
		navigator
			.share({
				title:
					languageDictionary.pageNames.about +
					' ' +
					languageDictionary.pageNames[pageName] +
					' | ' +
					languageDictionary['appName'],
				text: languageDictionary.seo[pageName].shareDescription,
				url: appURL + pathname
			})
			.then(() => console.log('Successful share'))
			.catch((err) => console.log('Error sharing', err));
	} else {
		const pageName = pathname.substring(1) || 'clock';
		navigator
			.share({
				title: languageDictionary.pageNames[pageName] + ' | ' + languageDictionary['appName'],
				text: languageDictionary.seo[pageName].shareDescription,
				url: appURL + pathname
			})
			.then(() => console.log('Successful share'))
			.catch((err) => console.log('Error sharing', err));
	}
}
