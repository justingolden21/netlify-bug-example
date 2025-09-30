<script lang="ts">
	// custom SEO metadata for each page - title, description, keywords, og:image, etc.
	import { page } from '$app/state';

	import { appURL, validPages } from '$lib/data/consts';
	import { dictionary } from '$lib/stores/languageDictionary';
	import { settings } from '$lib/stores/settings';
	import ldJsonWebsite from '$lib/util/ldJsonWebsite';
	import ldJsonPage from '$lib/util/ldJsonPage';

	const pageNameMapper: Record<string, string> = {
		'/birthdays': 'birthdays',
		'/calendar': 'calendar',
		'/chessclock': 'chessclock',
		'/': 'clock',
		'/countdown': 'countdown',
		'/pictureinpicture': 'pictureinpicture',
		'/pomodoro': 'pomodoro',
		'/rubikscube': 'rubikscube',
		'/stopwatch': 'stopwatch',
		'/sunrisesunset': 'sunrisesunset',
		'/timer': 'timer',
		'/timestamp': 'timestamp',
		'/weather': 'weather',
		'/worldclock': 'worldclock',
		'/about': 'about',
		'/changelog': 'changelog',
		'/more': 'more'
	};

	/**
	 * If it's an about page and not about an app, use 'about' for seo data
	 * If it's an about page about an app, use that app name for seo data
	 * Else, use the page name for seo data
	 *
	 * Note: page url (for `og:url` and `canonical`) is not changed
	 *
	 * For example, /worldclock uses 'worldclock' and /about/worldclock uses 'worldclock' but /about/app uses 'about'
	 *
	 * Fallback to '/' if page is not valid (404 page)
	 */
	const pathname = $derived(validPages.includes(page.url.pathname) ? page.url.pathname : '/');
	const isAboutPage = $derived(pathname.includes('/about/'));
	const isAboutApp = $derived(Object.values(pageNameMapper).includes(pathname.substring(7)));
	const pageName = $derived(
		isAboutPage ? (isAboutApp ? pathname.substring(7) : 'about') : pageNameMapper[pathname]
	);

	// Locales

	// Map ISO language codes to OG locale format
	const localeMapper = {
		en: 'en_US',
		es: 'es_ES',
		fr: 'fr_FR',
		hi: 'hi_IN'
	} as const;

	const currentLocale = $derived($settings.locale.language as keyof typeof localeMapper);
	const ogLocale = $derived(localeMapper[currentLocale ?? 'en']);
	const ogLocaleAlternates = $derived(
		Object.values(localeMapper).filter((locale) => locale !== ogLocale)
	);

	const seo = $derived($dictionary.seo[pageName]);

	// ld+json
	const websiteLdJson = $derived(ldJsonWebsite($dictionary.appName));
	const pageLdJson = $derived(
		ldJsonPage(
			appURL + pathname,
			seo.name,
			seo.description,
			$dictionary.appName,
			$dictionary.seo.clock.description,
			$dictionary.features
		)
	);
</script>

<!-- custom SEO based off of pathname -->
<svelte:head>
	<title>{seo.name}</title>

	<meta name="title" content={seo.name} />
	<meta name="description" content={seo.description} />
	<meta name="keywords" content={seo.keywords} />
	<meta name="robots" content="index,follow" />
	<meta name="googlebot" content="index,follow" />

	<meta property="og:image:height" content="720" />
	<meta property="og:image:width" content="720" />
	<meta property="og:description" content={seo.description} />
	<meta property="og:title" content={seo.name} />
	<meta property="og:url" content={appURL + pathname} />
	<meta property="og:image" content={appURL + '/img/screenshots/' + seo.screenshot} />
	<meta property="og:image:alt" content={seo.name} />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={seo.name} />
	<meta property="og:locale" content={ogLocale} />
	{#each ogLocaleAlternates as alt}
		<meta property="og:locale:alternate" content={alt} />
	{/each}

	<meta name="twitter:title" content={seo.name} />
	<meta name="twitter:description" content={seo.description} />
	<meta name="twitter:image" content={appURL + '/img/screenshots/' + seo.screenshot} />
	<meta name="twitter:image:alt" content={seo.name} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:url" content={appURL + pathname} />

	<link rel="canonical" href={appURL + pathname} />

	<!-- @link https://github.com/sveltejs/svelte/issues/2438#issuecomment-542166747 -->
	<!-- eslint-disable-next-line @typescript-eslint/no-unused-expressions -->
	{@html '<script type="application/ld+json">' + websiteLdJson + '</script>'}
	<!-- eslint-disable-next-line @typescript-eslint/no-unused-expressions -->
	{@html '<script type="application/ld+json">' + pageLdJson + '</script>'}
</svelte:head>
