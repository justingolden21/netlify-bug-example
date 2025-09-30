<script lang="ts">
	// header - contains page title, menu, and quick action buttons
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { onMount } from 'svelte';

	import AppIcon from '$lib/components/ui/AppIcon.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import PageIcon from '$lib/components/ui/PageIcon.svelte';
	import { appPages } from '$lib/data/consts';
	import { isFullscreen, onFullscreenChange } from '$lib/stores/fullscreen.svelte';
	import { dictionary } from '$lib/stores/languageDictionary';
	import { settings } from '$lib/stores/settings';
	import { castClock, isCastSupported, setupCasting } from '$lib/util/cast';
	import { now } from '$lib/util/now.svelte';
	import ToggleDisplay, { displayPages } from '$lib/util/toggleDisplay';
	import toggleFullscreen from '$lib/util/toggleFullscreen';

	interface Props {
		navOpen: boolean;
	}

	let { navOpen = $bindable() }: Props = $props();

	const castSupported = browser && isCastSupported(window);

	let timeSinceMove = $state(new Date());
	$effect(() => {
		if (browser) timeSinceMove = new Date();
	});

	onMount(setupCasting);

	// Minor bug: user has hideTitlebarWhenIdle off, then enters fullscreen, then turns it on, then leaves fullscreen, the setting will be turned off
	// Fix: when the user changes the setting in fullscreen, update oldHideTitlebarWhenIdle

	let oldHideTitlebarWhenIdle: boolean;
	onMount(() => {
		onFullscreenChange((isFullscreen) => {
			if (isFullscreen) {
				oldHideTitlebarWhenIdle = $settings.hideTitlebarWhenIdle;
				$settings.hideTitlebarWhenIdle = true;
			} else {
				$settings.hideTitlebarWhenIdle = oldHideTitlebarWhenIdle;
			}

			timeSinceMove = isFullscreen ? new Date(0) : timeSinceMove;
		});
	});

	let hideTitleBar = $derived(
		$settings.hideTitlebarWhenIdle &&
			(now.value.valueOf() - timeSinceMove.valueOf()) / 1000 > $settings.secondsUntilIdle
	);

	function togglePrimaryDisplay() {
		ToggleDisplay(page, settings, 'primary');
	}
	function toggleSecondaryDisplay() {
		ToggleDisplay(page, settings, 'secondary');
	}
</script>

<svelte:window onmousemove={() => (timeSinceMove = new Date())} />

<!-- Cover the page in a div with `cursor-none` that only appears when idle
to hide the cursor when idle -->
<div
	id="cursor-cover"
	class="fixed left-0 top-0 w-full h-full z-30 {hideTitleBar ? 'cursor-none' : 'hidden'}">
</div>

<header class="relative w-full print:hidden p-4">
	<Button
		icon={navOpen ? 'close' : 'menu'}
		size="icon"
		variant="ghost"
		className="mr-2 z-30 absolute
		{$settings.smallerMenu ? 'ml-4' : ''}
		{$settings.alwaysCollapseMenu || isFullscreen.value ? '' : 'md:hidden'}"
		onclick={() => (navOpen = !navOpen)}
		aria-label={$dictionary.labels['Menu']}>
	</Button>
	{#if navOpen && !$settings.smallerMenu}
		<div
			class="inline z-30 absolute w-10 ml-16
		{$settings.alwaysCollapseMenu || isFullscreen.value ? '' : 'md:hidden'}">
			<AppIcon />
		</div>
	{/if}

	<!-- Hide top buttons on short screens and fade out if idle -
		do this here instead of `<header>` because otherwise we hide the nav controls -->
	<div
		class="flex items-start gap-2 short:hidden short:h-0 transition-opacity {hideTitleBar
			? 'opacity-0'
			: 'opacity-100'}">
		<div
			class="isolate z-10 inline-block ml-16 {$settings.alwaysCollapseMenu || isFullscreen.value
				? ''
				: 'md:ml-0'}">
			<Button
				icon={$settings.darkMode ? 'moon' : 'sun'}
				size="icon"
				variant="ghost"
				animation={$settings.darkMode ? 'flip' : 'zoom'}
				className="mr-2 {!$settings.showDarkButton ? 'hidden' : ''}"
				onclick={() => {
					$settings.darkMode = !$settings.darkMode;
					$settings.pitchBlackMode = false;
					$settings.dayNightMode = false;
				}}
				title={$dictionary.labels['Toggle dark mode'] +
					($settings.keyboardShortcuts ? ' (N)' : '')}>
			</Button>

			<!-- only show toggle display buttons on pages with toggleable displays -->
			{#if displayPages.includes(page.url.pathname)}
				<Button
					icon="primary"
					size="icon"
					variant="ghost"
					className="mr-2 {!$settings.showPrimaryButton ? 'hidden' : ''}"
					onclick={togglePrimaryDisplay}
					title={$dictionary.labels['Toggle primary display'] +
						($settings.keyboardShortcuts ? ' (P)' : '')}>
				</Button>
				<Button
					icon="secondary"
					size="icon"
					variant="ghost"
					className="mr-2 {!$settings.showSecondaryButton ? 'hidden' : ''}"
					onclick={toggleSecondaryDisplay}
					title={$dictionary.labels['Toggle secondary display'] +
						($settings.keyboardShortcuts ? ' (D)' : '')}>
				</Button>
			{/if}

			{#if appPages.includes(page.url.pathname)}
				<Button
					element="a"
					icon="info"
					size="icon"
					variant="ghost"
					className="mr-2 {!$settings.showAboutButton ? 'hidden' : ''}"
					href={'/about' + (page.url.pathname === '/' ? '/clock' : page.url.pathname)}
					title={$dictionary.labels['Open about page']}>
				</Button>
			{/if}
		</div>

		<span class="grow"></span>
		<h1
			class="hidden sm:flex md:hidden lg:flex self-center items-center justify-center gap-4 absolute left-0 right-0 pointer-events-none">
			<div class="inline-block w-6 h-6">
				{#key page.url.pathname}
					<PageIcon page={page.url.pathname.substring(1) || 'clock'} />
				{/key}
			</div>
			<span class="h4">
				{$dictionary.pageNames[page.url.pathname.substring(1) || 'clock'] || ''}
			</span>
		</h1>

		<Button
			icon="cast"
			size="icon"
			variant="ghost"
			animation="flip-horizontal"
			className="mr-2 {!$settings.showCastButton || !castSupported ? 'hidden' : ''}"
			onclick={castClock}
			title={$dictionary.labels['Cast clock']}>
		</Button>
		<Button
			icon="fullscreen"
			size="icon"
			variant="ghost"
			animation="flip-horizontal"
			className={!$settings.showFullscreenButton ? 'hidden' : ''}
			onclick={toggleFullscreen}
			title={$dictionary.labels['Toggle fullscreen'] + ($settings.keyboardShortcuts ? ' (F)' : '')}>
		</Button>
	</div>
</header>
