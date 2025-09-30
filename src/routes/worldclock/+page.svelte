<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';

	import WorldclockTray from '$lib/components/pages/worldclock/WorldclockTray.svelte';
	import Worldclocks from '$lib/components/pages/worldclock/Worldclocks.svelte';
	import { dictionary } from '$lib/stores/languageDictionary';
	import { setThemeFromURL } from '$lib/util/theme';

	onMount(() => {
		if (page.url.searchParams.has('theme')) {
			setThemeFromURL('worldclock', page.url, $dictionary);
		}
	});
</script>

<div class="grid grid-rows-[1fr_auto] h-full">
	<section class="page-container w-full">
		<Worldclocks />
	</section>

	<WorldclockTray />
</div>
