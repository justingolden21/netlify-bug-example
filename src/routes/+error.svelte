<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';

	import VectorArt from '$lib/components/features/misc/VectorArt.svelte';
	import PageCard from '$lib/components/features/misc/PageCard.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { dictionary } from '$lib/stores/languageDictionary';

	const error = $derived(page.error!);
	const status = $derived(page.status);
	$effect(() => {
		if (browser && document.location.hostname.search('desktopclock.app') !== -1) {
			gtag('event', 'error-page', {
				error_message: error.message,
				status
			});
		}
	});
</script>

<svelte:head>
	<title>{$dictionary.error['Error'] + (status === 404 ? ' 404' : '')}</title>
</svelte:head>

<section class="page-container text-center">
	{#if status === 404}
		<div class="select-none w-96 mx-auto mb-10">
			<VectorArt name="not_found" />
		</div>
		<h2 class="h2 mb-4">{$dictionary.error['The resource could not be found']}</h2>
	{/if}
	<p class="p-lg mb-10">{$dictionary.error['Error']} {status} &mdash; {error?.message}</p>

	<Button element="a" href="/">
		{$dictionary.error['Go back to the homepage']}
	</Button>

	{#if status === 404}
		<hr class="my-10 max-w-full" />
		<div class="grid sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
			<PageCard page="clock" link="/" />
			<PageCard page="worldclock" link="/worldclock" />
			<PageCard page="stopwatch" link="/stopwatch" />
			<PageCard page="timer" link="/timer" />
			<PageCard page="more" link="/more" />
			<PageCard page="about" link="/about" />
		</div>
	{/if}
</section>
