<script lang="ts">
	/**
	 * Renders the about page home, `/about`
	 *
	 * Displays a list of about page cards
	 */

	import PageCard from '$lib/components/features/misc/PageCard.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import { appNames } from '$lib/data/consts';
	import { dictionary } from '$lib/stores/languageDictionary';

	const pages = $derived(appNames as PageIcons[]);
</script>

<section class="page-container">
	<h3 class="h3 mb-2">{$dictionary.aboutPages.aboutClocks}</h3>
	<p class="p-lg mb-4">{$dictionary.seo.about.description}</p>

	<div class="grid sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
		{#each pages as page}
			<PageCard {page} link={'/about/' + page} />
		{/each}
	</div>

	<h3 class="h3 mt-10 mb-2">{$dictionary.aboutPages.aboutDateTime}</h3>
	<p class="p-lg mb-4">{$dictionary.aboutPages.aboutDateTimeDesc}</p>

	<div class="grid sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
		<Card link="/about/time" icon="clock" title={$dictionary.aboutPages.aboutTime} />
		<Card link="/about/dates" icon="calendar" title={$dictionary.aboutPages.aboutDates} />
	</div>

	<h3 class="h3 mt-10 mb-2">{$dictionary.aboutPages.aboutApp}</h3>
	<p class="p-lg mb-4">{$dictionary.aboutPages.aboutAppDesc}</p>

	<div class="grid sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
		<Card link="/about/app" icon="application" title={$dictionary.aboutPages.aboutApp} />
		<Card link="/about/goals" icon="application" title={$dictionary.aboutPages.aboutGoals} />
	</div>
</section>
