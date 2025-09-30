<script lang="ts">
	import '$lib/css/app.postcss';

	import type { PageData } from './$types';
	import { browser } from '$app/environment';
	import { navigating, page } from '$app/state';
	// import { isMajorChange } from '$lib/stores/isMajorChange';
	import Screenfull from 'screenfull';
	import { onMount } from 'svelte';
	import type { MouseEventHandler } from 'svelte/elements';
	import { fly } from 'svelte/transition';
	import TailwindColors from 'tailwindcss/colors.js';

	import BackgroundDayNightGradient from '$lib/components/features/misc/BackgroundDayNightGradient.svelte';
	import BackgroundPattern from '$lib/components/features/misc/BackgroundPattern.svelte';
	import KeyboardShortcuts from '$lib/components/features/settings/KeyboardShortcuts.svelte';
	import Header from '$lib/components/layout/Header.svelte';
	import Nav from '$lib/components/layout/Nav.svelte';
	import SEO from '$lib/components/head/SEO.svelte';
	import Loader from '$lib/components/ui/Loader.svelte';
	import ModalManager from '$lib/components/ui/ModalManager.svelte';
	import { requestWakeLock } from '$lib/components/features/settings/SettingsPanelGeneral.svelte';
	import Toasts from '$lib/components/ui/Toast.svelte';
	import { systemFontFamilies } from '$lib/data/consts';
	import { isFullscreen } from '$lib/stores/fullscreen.svelte';
	import { dictionary, dictionaryAbout } from '$lib/stores/languageDictionary';
	import { settings } from '$lib/stores/settings';
	import { hexToRgb } from '$lib/util/color';
	import fetchLanguage from '$lib/util/fetchLanguage';
	import sendAnalytics from '$lib/util/googleAnalytics';
	import { importLegacyTheme } from '$lib/util/importLegacyTheme';
	import initializeSettings from '$lib/util/initializeSettings';
	import { setupInstall } from '$lib/util/install.svelte';
	import { derived as derivedStore } from 'svelte/store';
	// import { checkUpdates } from '$lib/util/updates';

	// Load dictionary here from server initially, default to 'en' and then change on page load.
	// This is to make the app load without having to wrap everything in `{#if !loading}`, which would break SEO.
	// Can't `fetch` until `onMount`, so we pass in data from the server.
	interface Props {
		data: PageData;
		children: import('svelte').Snippet;
	}

	const { data, children }: Props = $props();
	$dictionary = data.languageDictionary;

	let loading = $state(true);
	let navOpen = $state(false);

	// Close nav when changing pages
	$effect(() => {
		if (navigating) navOpen = false;
	});

	function doubleClickFullscreen(event: Parameters<MouseEventHandler<HTMLElement>>[0]) {
		const target = event.target as HTMLElement;
		if (!$settings.doubleclickFullscreen) return;
		const parent = target.parentNode as HTMLElement;
		if (target.tagName === 'BUTTON' || parent.tagName === 'BUTTON') return;
		if (target.tagName === 'A' || parent.tagName === 'A') return;
		if (Screenfull.isEnabled) Screenfull.toggle();
	}

	// check when session changes
	// also check that browser exists so we can reference document
	// toggle dark class based on setting
	$effect(() => {
		if (browser)
			$settings.darkMode
				? document.documentElement.classList.add('dark')
				: document.documentElement.classList.remove('dark');
	});

	// ================
	// reverse compatibility
	// this works. don't touch it.
	const oldGrays = ['warmGray', 'trueGray', 'gray', 'coolGray', 'blueGray'] as const;
	const newGrays = ['stone', 'neutral', 'zinc', 'gray', 'slate'] as const;
	if (!$settings.recentVersion && $settings.baseColorPalette in oldGrays) {
		$settings.baseColorPalette =
			newGrays[oldGrays.indexOf($settings.baseColorPalette as ArrayValues<typeof oldGrays>)];
	}

	// uncomment to simulate user with old palette setting
	// then reload page, it should error, then recomment and reload page
	// and it should run the fix above without breaking here

	// $settings.baseColorPalette = 'warmGray';
	// $settings.recentVersion = undefined;

	// ================

	onMount(() => {
		// legacy support
		$settings = importLegacyTheme($settings);

		// Necessary to load user's setting language on page load
		// otherwise they would just get whatever lang `hooks.server.ts` finds from browser/device setting
		initializeSettings();

		// Safeguard to use supported lang
		const lang = derivedStore(settings, ($settings) => {
			if (
				!$settings.locale.language ||
				!['en', 'es', 'fr', 'hi'].includes($settings.locale.language)
			) {
				return 'en';
			}
			return $settings.locale.language;
		});
		// Update language dictionaries when language setting language changes
		lang.subscribe((lang) => {
			fetchLanguage(lang).then(dictionary.set);
			fetchLanguage(lang, true).then(dictionaryAbout.set);

			// Keep <html lang> in sync for SEO
			if (browser) document.documentElement.lang = lang;
		});

		setTimeout(() => (loading = false), 1000);

		// checkVersion();
		setupInstall();

		sendAnalytics();

		if ($settings.wakeLock) requestWakeLock($dictionary);
	});

	// Gets version number from service worker and sets isMajorChange flag then checks for updates
	// async function checkVersion() {
	// 	const versionChannel = new BroadcastChannel('versionChannel');

	// 	versionChannel.addEventListener('message', ({ data }) => {
	// 		if (!data.startsWith('VERSION')) return;

	// 		versionChannel.postMessage('GOT_VERSION');
	// 		const version = data.split(':')[1];

	// 		// NOTE: this code assumes recentVersion and __version__ are in format major.minor.patch
	// 		// and if it's null or undefined, then it assumes this is first load and does nothing
	// 		if (typeof $settings.recentVersion === 'string') {
	// 			const [oldMajor, oldMinor] = $settings.recentVersion.split('.');
	// 			const [newMajor, newMinor] = version.split('.');
	// 			if (oldMajor !== newMajor) {
	// 				$isMajorChange = true;
	// 			} else if (oldMinor !== newMinor) {
	// 				$isMajorChange = true;
	// 			}
	// 		}

	// 		$settings.recentVersion = __version__;
	// 		checkUpdates({ languageDictionary: $dictionary, lang: $settings.locale.language ?? 'en' });
	// 	});
	// }

	const themeColor = $derived(
		TailwindColors[$settings.baseColorPalette][$settings.darkMode ? 900 : 200]
	);

	// we store numbers as list of rgb values for use in withOpacity in tailwind.config.cjs
	const paletteVariablesHTML = $derived(
		(['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'] as const)
			.map(
				(lightness) =>
					`--base-${lightness}: ${hexToRgb(TailwindColors[$settings.baseColorPalette][lightness])}; 
				--accent-${lightness}: ${hexToRgb(TailwindColors[$settings.accentColorPalette][lightness])};`
			)
			.join('')
	);

	const navHidden = $derived($settings.alwaysCollapseMenu || isFullscreen.value);
</script>

<svelte:head>
	<meta name="apple-mobile-web-app-status-bar" content={themeColor} />
	<meta name="theme-color" content={themeColor} />
	<meta name="color-scheme" content={$settings.darkMode ? 'dark' : 'light'} />
	<meta name="msapplication-TileColor" content={themeColor} />
	<link rel="mask-icon" href="/img/icons/safari-pinned-tab.svg" color={themeColor} />
</svelte:head>

<svelte:body ondblclick={doubleClickFullscreen} />

<div class:dark={$settings.darkMode} class:day-night={$settings.dayNightMode} class="contents">
	<main
		class="bg-gradient-to-tr dark:from-base-900 dark:to-base-800 from-base-50 to-white dark:text-base-50 text-base-900 transition-colors h-full overflow-hidden grid grid-rows-[auto_1fr] {navHidden
			? ''
			: 'md:grid-cols-[auto_1fr]'} {$settings.pitchBlackMode ? '!from-black !to-black' : ''}"
		class:pitch-black={$settings.pitchBlackMode}
		class:invert={$settings.invertMode}
		style:--font-family={$settings.fontFamily || systemFontFamilies}
		style:--font-family-body={$settings.fontFamilyBody}
		style={paletteVariablesHTML}>
		<SEO />

		<Loader {loading} />
		{#if $settings.dayNightMode}
			<BackgroundDayNightGradient />
		{/if}

		<KeyboardShortcuts />
		{#if !loading}
			<Toasts />

			<Nav bind:navOpen />
			<Header bind:navOpen />
			{#key page.url.pathname}
				<!--
					Page transitions
					@link https://youtu.be/gkw1wFIXM_8

					`z-[1]` is used to establish stacking context - to make sure that `-z-10` items appear
				-->
				<div
					in:fly={{ x: -160, duration: 250 }}
					class="z-[1] overflow-auto md:row-start-2 md:row-end-3 {navHidden
						? ''
						: 'relative overflow-x-auto md:col-start-2 md:col-end-3'}">
					{@render children()}
					{#if !$settings.pitchBlackMode}
						<BackgroundPattern />
					{/if}
				</div>
			{/key}

			<ModalManager />
		{/if}
	</main>
</div>
