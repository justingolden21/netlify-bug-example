<script lang="ts">
	/**
	 * Renders an individual about page, for example, `/about/clock` or `/about/app`
	 *
	 * Obtains data from adjacent `+page.server.ts` and renders it in `TextBlocks`
	 * Displays more complex UI for pages about a specific app
	 * Has a title and subtitle for app name and page name, and has a link to view all about pages
	 */

	import { onMount } from 'svelte';

	import PageCard from '$lib/components/features/misc/PageCard.svelte';
	import Breadcrumbs from '$lib/components/ui/Breadcrumbs.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import PageIcon from '$lib/components/ui/PageIcon.svelte';
	import StickySidebar from '$lib/components/ui/StickySidebar.svelte';
	import TextBlocks, { type TextItem } from '$lib/components/features/misc/TextBlocks.svelte';
	import { appNames } from '$lib/data/consts';
	import { dictionary, dictionaryAbout } from '$lib/stores/languageDictionary';
	import shareApp from '$lib/util/shareApp';

	interface Props {
		data: { slug: string };
	}

	const { data }: Props = $props();
	const slug = $derived(data.slug);

	const headings = $derived(
		$dictionaryAbout?.[slug]
			? [
					...$dictionaryAbout[slug]
						.filter((item: TextItem) => item.title !== '')
						.map((item: TextItem) => item.title)
				]
			: []
	);

	const showSidebar = $derived(headings.length > 2);
	const aboutAnApp = $derived(appNames.includes(slug));

	// Scroll to hash on page load
	onMount(() => {
		if (window.location.hash) {
			const anchor = document.querySelector(window.location.hash);
			if (anchor) {
				anchor.scrollIntoView({ behavior: 'smooth' });
			}
		}
	});

	function getTitle(pageName: string) {
		return (
			{
				app: $dictionary.aboutPages.aboutApp,
				goals: $dictionary.aboutPages.aboutGoals,
				time: $dictionary.aboutPages.aboutTime,
				dates: $dictionary.aboutPages.aboutDates
			}[pageName] ?? ''
		);
	}
</script>

<div class="page-container">
	<Breadcrumbs
		items={[
			{ label: $dictionary.appName, href: '/' },
			{ label: $dictionary.settingsTabs['About'], href: '/about' },
			{ label: $dictionary.pageNames[slug] ?? getTitle(slug) }
		]} />

	<div class="mt-6 pb-6 mb-10 text-center border-b-2 border-base-300 dark:border-base-600">
		<h2 class="h4 mb-2 opacity-50">
			{$dictionary.appName}
		</h2>
		<h2 class="h1">
			{#if aboutAnApp}
				<a class="group" href={'/' + (slug === 'clock' ? '' : slug)}>
					<div class="inline-block w-10 h-10 mr-2">
						<PageIcon page={slug} />
					</div>
					<span class="h1 group-hover:underline">
						{$dictionary.pageNames[slug]}
					</span>
				</a>
			{:else if slug === 'app'}
				<Icon name="application" size="lg" />
				{$dictionary.aboutPages.aboutApp}
			{:else if slug === 'goals'}
				<Icon name="application" size="lg" />
				{$dictionary.aboutPages.aboutGoals}
			{:else if slug === 'time'}
				<Icon name="clock" size="lg" />
				{$dictionary.aboutPages.aboutTime}
			{:else if slug === 'dates'}
				<Icon name="calendar" size="lg" />
				{$dictionary.aboutPages.aboutDates}
			{/if}
		</h2>
	</div>

	<!-- TODO: split into three sections: overview, features, and help
		overview explains the purpose of app and common info and use cases
		features explains what the app can do
		help has info on doing specific things, possibly with screenshots
	-->

	{#if showSidebar}
		<div class="flex flex-col lg:flex-row lg:gap-6 xl:gap-10 relative">
			<div
				class="lg:sticky lg:top-0 h-min bg-base-100 dark:bg-base-800 rounded p-4 lg:mt-6 lg:min-w-[16rem] xl:min-w-[20rem]">
				<StickySidebar {headings} />
			</div>
			<div class="col-span-2">
				<TextBlocks items={$dictionaryAbout?.[slug] ?? []} />
			</div>
		</div>
	{:else}
		<TextBlocks items={$dictionaryAbout?.[slug] ?? []} />
	{/if}

	{#if aboutAnApp}
		<div class="my-10 w-full mx-auto">
			<PageCard page={slug} link={'/' + (slug === 'clock' ? '' : slug)} />
		</div>

		<!-- TODO see if i18n makes sense in other languages, similar logic is also present in shareApp -->
		<div class="flex flex-wrap items-center justify-center gap-4 lg:gap-10">
			<Button
				icon="share"
				animation="flip-rotate"
				onclick={() => shareApp($dictionary, '/about/' + slug)}>
				{$dictionary.labels['Share']}
				{$dictionary.settingsTabs['About']}
				{$dictionary.pageNames[slug]}
			</Button>
			<Button
				icon="share"
				animation="flip-rotate"
				onclick={() => shareApp($dictionary, '/' + (slug === 'clock' ? '' : slug))}>
				{$dictionary.labels['Share']}
				{$dictionary.pageNames[slug]}
			</Button>
		</div>
	{/if}
</div>
