<script lang="ts">
	import { browser } from '$app/environment';

	import PageCard from '$lib/components/features/misc/PageCard.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import { dictionary } from '$lib/stores/languageDictionary';
	import shareApp from '$lib/util/shareApp';
	import { defaultSettings, settings } from '$lib/stores/settings';

	const simpleView = $derived($settings.more.displays.primary === 'simple');

	const clocks = [
		{ page: 'clock', link: '/' },
		{ page: 'worldclock', link: '/worldclock' },
		{ page: 'pictureinpicture', link: '/pictureinpicture' }
	];
	const datesEvents = [
		{ page: 'calendar', link: '/calendar' },
		{ page: 'birthdays', link: '/birthdays' },
		{ page: 'sunrisesunset', link: '/sunrisesunset' },
		{ page: 'weather', link: '/weather' },
		{ page: 'timestamp', link: '/timestamp' }
	];
	const timersStopwatches = [
		{ page: 'stopwatch', link: '/stopwatch' },
		{ page: 'timer', link: '/timer' },
		{ page: 'countdown', link: '/countdown' },
		{ page: 'pomodoro', link: '/pomodoro' },
		{ page: 'chessclock', link: '/chessclock' },
		{ page: 'rubikscube', link: '/rubikscube' }
	];
	const abouts = [
		{ link: '/about', icon: 'info' as const, title: $dictionary.pageNames.about },
		{ link: '/about/app', icon: 'application' as const, title: $dictionary.aboutPages.aboutApp },
		{ link: '/about/time', icon: 'clock' as const, title: $dictionary.aboutPages.aboutTime },
		{ link: '/about/dates', icon: 'calendar' as const, title: $dictionary.aboutPages.aboutDates },
		{ link: 'changelog', icon: 'changelog' as const, title: $dictionary.pageNames.changelog }
	];

	const allPages = clocks.concat(datesEvents, timersStopwatches).map((item) => item.page);
</script>

<section class="page-container">
	<div class="grid sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
		{#if !simpleView}
			<h3 class="divider h3 font-light">{$dictionary.moreSections['Clocks']}</h3>
		{/if}
		{#each clocks as item}
			<PageCard page={item.page} link={item.link} showPin showDescription={!simpleView} />
		{/each}

		{#if !simpleView}
			<h3 class="divider h3 font-light">{$dictionary.moreSections['Dates and Events']}</h3>
		{/if}
		{#each datesEvents as item}
			<PageCard page={item.page} link={item.link} showPin showDescription={!simpleView} />
		{/each}

		{#if !simpleView}
			<h3 class="divider h3 font-light">{$dictionary.moreSections['Timers and Stopwatches']}</h3>
		{/if}
		{#each timersStopwatches as item}
			<PageCard page={item.page} link={item.link} showPin showDescription={!simpleView} />
		{/each}

		{#if $settings.more.displays.secondary !== 'none'}
			{#if !simpleView}
				<h3 class="mt-24 divider h3 font-light">{$dictionary.pageNames.about}</h3>
			{/if}
			{#each abouts as item}
				<Card link={item.link} icon={item.icon} title={item.title} />
			{/each}
		{/if}
	</div>

	{#if $settings.more.displays.secondary !== 'none'}
		<div class="mt-24 flex flex-wrap gap-4 lg:gap-6">
			<Button
				icon="undo"
				variant="outline"
				animation="move-left"
				onclick={() => ($settings.pinnedPages = defaultSettings.pinnedPages)}>
				{$dictionary.labels['Reset pinned pages']}
			</Button>
			<Button
				icon="pin"
				variant="outline"
				animation="rotate-counter"
				onclick={() => ($settings.pinnedPages = allPages)}>
				{$dictionary.labels['Pin all pages']}
			</Button>
			{#each ['/', '/more'] as sharePath}
				{#if browser && navigator.share !== undefined}
					<Button
						icon="share"
						variant="outline"
						animation="flip-rotate"
						onclick={() => shareApp($dictionary, sharePath)}>
						{$dictionary.labels['Share']}
						{#if sharePath === '/more'}
							{$dictionary.pageNames.more}
						{/if}
					</Button>
				{/if}
			{/each}
		</div>
	{/if}
</section>

<style lang="postcss">
	.divider {
		@apply col-span-full select-none bg-base-700 p-2 text-center text-base-50 md:p-4;
	}
</style>
