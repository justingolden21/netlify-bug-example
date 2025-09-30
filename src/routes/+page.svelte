<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';

	import AnalogClock from '$lib/components/features/analog/AnalogClock.svelte';
	import { dictionary } from '$lib/stores/languageDictionary';
	import { settings } from '$lib/stores/settings';
	import { allThemes } from '$lib/stores/themes';
	import { defaultTheme } from '$lib/themes';
	import { setThemeFromURL } from '$lib/util/theme';

	const currentTheme = $derived(
		$allThemes.find((theme) => theme.id == $settings['clock'].themeID) ??
			JSON.parse(JSON.stringify(defaultTheme))
	);

	onMount(() => {
		if (page.url.searchParams.has('theme')) {
			setThemeFromURL('clock', page.url, $dictionary);
		}
	});

	const isAnalog = $derived($settings.clock.displays.primary === 'analog');
</script>

<section
	class="page-container grid items-center grid-rows-[1fr_auto] gap-4 h-full max-h-full relative">
	{#if isAnalog}
		<div
			in:fly|local={{ y: -160, duration: 250 }}
			class="max-w-full max-h-full overflow-hidden flex justify-center">
			<AnalogClock theme={currentTheme} />
		</div>
	{/if}

	<div class="h-full">
	</div>
</section>
