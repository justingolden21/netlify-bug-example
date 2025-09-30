<script lang="ts">
	import { flip } from 'svelte/animate';
	import { fade, scale } from 'svelte/transition';

	import NoStopwatches from '$lib/components/pages/stopwatch/NoStopwatches.svelte';
	import Stopwatch from '$lib/components/pages/stopwatch/Stopwatch.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { dictionary } from '$lib/stores/languageDictionary';
	import { settings } from '$lib/stores/settings';
	import checkTooManyStopwatches from '$lib/util/checkTooManyStopwatches';
	import { open } from '$lib/util/modal.svelte';
	import uid from '$lib/util/uid';

	const makeNewStopwatch = () => {
		const tooMany = checkTooManyStopwatches($dictionary, $settings.stopwatch.stopwatches.length, 1);
		if (tooMany) return;

		$settings.stopwatch.stopwatches = [
			...$settings.stopwatch.stopwatches,
			{
				times: $settings.stopwatch.autoStartStopwatches ? [Date.now()] : [],
				laps: [],
				id: uid(),
				name: ''
			}
		];
	};

	const deleteAllStopwatches = () => {
		$settings.stopwatch.stopwatches = [];
	};
</script>

<div
	class="grid gap-4 lg:gap-6 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
	class:flex-grow={$settings.stopwatch.stopwatches.length > 0}>
	{#each $settings.stopwatch.stopwatches as stopwatch, idx (stopwatch.id)}
		{@const largerStopwatch = idx === 0 && $settings.stopwatch.largerFirstStopwatch}
		<div
			animate:flip={{ duration: 250 }}
			in:scale|local={{ duration: 250 }}
			out:fade|local={{ duration: 125 }}
			class:col-span-full={largerStopwatch}>
			<Stopwatch bind:data={$settings.stopwatch.stopwatches[idx]} />
		</div>
	{/each}
</div>

{#if $settings.stopwatch.stopwatches.length === 0}
	<NoStopwatches />
{/if}

<div class:flex-grow={$settings.stopwatch.stopwatches.length === 0}></div>

<div class="mt-10 flex flex-wrap gap-4 lg:gap-6">
	<Button
		size="lg"
		icon="plus"
		animation="zoom"
		variant="outline"
		onclick={makeNewStopwatch}
		title={$dictionary.stopwatchSettings['New stopwatch']}>
		{$dictionary.labels['New']}
	</Button>

	{#if $settings.stopwatch.stopwatches.length > 4}
		<Button
			size="lg"
			variant="outline"
			icon="trash"
			animation="rotate-clock-sm"
			onclick={deleteAllStopwatches}>
			{$dictionary.labels['Delete all']}
		</Button>
	{/if}

	<Button
		size="lg"
		variant="outline"
		icon="stopwatch"
		animation="move-up"
		onclick={() => open('simultaneous-start')}>
		{$dictionary.stopwatchSettings['Simultaneous start']}
	</Button>
</div>
