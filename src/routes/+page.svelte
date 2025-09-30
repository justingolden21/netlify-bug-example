<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';

	import { dictionary } from '$lib/stores/languageDictionary';
	import { setThemeFromURL } from '$lib/util/theme';

	onMount(() => {
		if (page.url.searchParams.has('theme')) {
			setThemeFromURL('clock', page.url, $dictionary);
		}
	});
</script>

<section
	class="page-container grid items-center grid-rows-[1fr_auto] gap-4 h-full max-h-full relative"
>
	<div class="h-full"></div>
</section>
