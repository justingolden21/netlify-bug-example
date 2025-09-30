<script lang="ts">
	// nav menu - contains pinned pages, settings, install and share buttons
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { scale } from 'svelte/transition';

	import { isFullscreen } from '$lib/stores/fullscreen.svelte';
	import { dictionary } from '$lib/stores/languageDictionary';
	import { settings } from '$lib/stores/settings';

	interface Props {
		navOpen: boolean;
	}

	let { navOpen = $bindable() }: Props = $props();

	// Swipe to toggle nav logic

	onMount(() => {});

	let startCloseX = 0;

	// Consistent order for pinned nav pages
	// Dividers used to section pages by category
	// See more/+page.svelte for categories
	// TODO: make this refer to more/+page.svelte as source of truth instead of hardcoding here
	const pinnedPageOrder = [
		// clocks
		'clock',
		'worldclock',
		'pictureinpicture',
		'divider1', // dates and events
		'calendar',
		'birthdays',
		'sunrisesunset',
		'weather',
		'timestamp',
		'divider2', // timers and stopwatches
		'stopwatch',
		'timer',
		'countdown',
		'pomodoro',
		'chessclock',
		'rubikscube',
		'divider3', // more
	] as const;
</script>

<button
	aria-label={$dictionary.labels['Close']}
	class="bg-black/10 dark:bg-white/5 z-20 fixed inset-0 w-full md:hidden"
	class:hidden={!navOpen}
	class:md:hidden={!$settings.alwaysCollapseMenu && !isFullscreen.value}
	onclick={() => (navOpen = false)}
></button>
<!-- Touch listeners enable user to swipe to close nav
	If user swipes left on nav and swipe is > 80px, close nav -->
<nav
	ontouchstart={(e) => (startCloseX = e.touches[0].clientX)}
	ontouchmove={(e) => {
		if (e.touches[0].clientX - startCloseX < -80) navOpen = false;
	}}
	class="
		md:row-start-1
		md:row-end-3
		md:col-start-1
		md:col-end-2
		px-6
		pt-16
		md:pt-6
		pb-10
		fixed
		left-0
		top-0
		bottom-0
		transition-all
		duration-125
		z-20
		surface
		border-0
		border-r-2
		flex
		flex-col
		select-none
		overflow-y-auto
		print:hidden
		{$settings.alwaysCollapseMenu || isFullscreen.value
		? ''
		: 'md:relative md:translate-x-0'}
		{$settings.smallerMenu
		? ''
		: 'w-[18rem] min-w-[18rem] lg:w-[20rem] lg:min-w-[20rem]'}"
	class:-translate-x-full={!navOpen}
>
	<button
		aria-label={$dictionary.labels['Smaller menu']}
		class="btn-collapse hidden md:block right-0 top-0 bottom-0 absolute w-2"
		onclick={() => ($settings.smallerMenu = !$settings.smallerMenu)}
	>
	</button>

	{#if !$settings.smallerMenu && !$settings.alwaysCollapseMenu && !isFullscreen.value}
		<div class="hidden md:flex items-center gap-4 pb-6 pl-4">
			<div class="inline w-10"></div>
			<h2 class="inline h4">
				{$dictionary.appName}
			</h2>
		</div>
	{/if}
	{#if $settings.alwaysCollapseMenu || isFullscreen.value}
		<div class="h-0 md:h-10"></div>
	{/if}

	{#each pinnedPageOrder as pinnedPage (pinnedPage)}
		{@const path = '/' + (pinnedPage === 'clock' ? '' : pinnedPage)}
		{#if pinnedPage.startsWith('divider')}
			<hr />
		{:else if $settings.pinnedPages.includes(pinnedPage) || page.url.pathname === path}
			<div class="relative">
				<a
					transition:scale={{ duration: 250 }}
					class:active={page.url.pathname === path}
					href={path}
					onclick={() => (navOpen = false)}
					class="p group {$settings.smallerMenu ? '' : 'w-full'}"
				>
					<span
						class="inline-block w-6 h-6 {$settings.smallerMenu
							? ''
							: 'mr-2'}"
					>
					</span>
					{#if !$settings.smallerMenu}
						{$dictionary.pageNames[pinnedPage]}
					{/if}
				</a>
			</div>
		{/if}
	{/each}

	<a
		class:active={page.url.pathname === '/more'}
		href="/more"
		onclick={() => (navOpen = false)}
		class="p {$settings.smallerMenu ? '' : 'w-full'}"
	>
		<span
			class="inline-block w-6 h-6 {$settings.smallerMenu ? '' : 'mr-2'}"
		>
		</span>
		{#if !$settings.smallerMenu}
			{$dictionary.pageNames['more']}
		{/if}
	</a>

	<a
		class:active={page.url.pathname.startsWith('/about')}
		href="/about"
		onclick={() => (navOpen = false)}
		class="p {$settings.smallerMenu ? '' : 'w-full'}"
	>
		<span
			class="inline-block w-6 h-6 {$settings.smallerMenu ? '' : 'mr-2'}"
		>
		</span>
		{#if !$settings.smallerMenu}
			{$dictionary.pageNames['about']}
		{/if}
	</a>

	<button
		class="p {$settings.smallerMenu ? '' : 'w-full'}"
		onclick={() => {
			navOpen = false;
		}}
	>
		{#if !$settings.smallerMenu}
			{$dictionary.labels['Settings']}
		{/if}
	</button>

	<span class="grow"></span>

	{#if browser && navigator.share !== undefined}
		<button class="p {$settings.smallerMenu ? '' : 'w-full'}">
			{#if !$settings.smallerMenu}
				{$dictionary.labels['Share']}
			{/if}
		</button>
	{/if}
</nav>

<style lang="postcss">
	/* notes
	nav links and icon btns have same hover colors (both normal and dark)
	nav and modal have same bg colors and opacities
	*/
	nav a,
	nav button:not(.btn-collapse):not(.pin-btn) {
		@apply flex items-center font-normal;
		@apply w-full cursor-pointer p-4 text-left text-base-700;
	}
	nav a:hover,
	nav button:hover,
	nav a.active {
		@apply bg-base-300/50;
	}
	:global(.dark) nav a,
	:global(.dark) nav button:not(.btn-collapse):not(.pin-btn) {
		@apply text-base-200;
	}
	:global(.dark) nav a:hover,
	:global(.dark) nav a.active,
	:global(.dark) nav button:hover {
		@apply bg-base-700/50;
	}
	nav a.active {
		@apply font-bold;
	}

	/* Remove two consecutive dividers */
	hr + hr {
		@apply hidden;
	}
</style>
