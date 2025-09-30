<script lang="ts">
	/**
	 * A card for displaying a link to an app page or about app page
	 * Optionally, featuring a pin icon to pin the clock to side panel
	 * (for use on the `/more` page)
	 */

	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { dictionary } from '$lib/stores/languageDictionary';
	import { settings } from '$lib/stores/settings';

	interface Props {
		page: PageIcons;
		link: string;
		showPin?: boolean;
		showDescription?: boolean;
	}

	const { page, link, showPin = false, showDescription = true }: Props = $props();

	const title = $derived($dictionary.pageNames[page]);
	const description = $derived($dictionary.seo[page].description);
	const isPinned = $derived($settings.pinnedPages.includes(page));

	// Add or remove the page from the pinned list without triggering navigation
	function togglePin(evt: MouseEvent) {
		evt.stopPropagation();
		if (isPinned) {
			$settings.pinnedPages = $settings.pinnedPages.filter((p) => p !== page);
		} else {
			$settings.pinnedPages = [...$settings.pinnedPages, page];
		}
	}
</script>

<Card pageIcon={page} {title} description={showDescription ? description : ''} {link}>
	{#if showPin}
		<Button
			variant="ghost"
			size="icon"
			className="absolute top-4 right-4 group"
			onclick={togglePin}
			title={$dictionary.labels['Pin to menu']}>
			<Icon
				name="pin"
				className="stroke-base-500 transition-transform duration-125 {isPinned
					? 'group-hover:fill-none fill-base-500 -rotate-45'
					: 'group-hover:fill-base-500 fill-none'}" />
		</Button>
	{/if}
</Card>
