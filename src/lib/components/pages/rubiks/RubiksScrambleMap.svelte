<script lang="ts">
	/**
	 * Displays a 2d rubiks scramble color map, scramble string and quick buttons
	 *
	 * Uses the current scramble stored in settings
	 */
	import { onMount } from 'svelte';

	import Button from '$lib/components/ui/Button.svelte';
	import { dictionary } from '$lib/stores/languageDictionary';
	import { settings } from '$lib/stores/settings';
	import { open } from '$lib/util/modal.svelte';
	import { getSquares, generateScramble } from '$lib/util/rubiksScrambleMap.svelte';

	onMount(() => generateScramble($settings.rubiks.scramble === ''));
</script>

<p class="h3 font-light whitespace-nowrap overflow-x-auto">
	{$settings.rubiks.scramble}
</p>

<svg
	viewBox="-2.5 -2.5 620 465"
	class="my-4 lg:my-6 mx-auto md:max-h-[40vh]"
	xmlns="http://www.w3.org/2000/svg">
	<g class="stroke-base-100 dark:stroke-base-900" stroke-width="2.5">
		{#each getSquares() as { x, y, color }}
			<rect {x} {y} fill={color} width={50} height={50} class="transition-colors" />
		{/each}
	</g>
</svg>

<div class="grid gap-4 lg:gap-6 sm:grid-cols-2 2xl:grid-cols-4">
	<Button
		variant="outline"
		animation="move-right"
		icon="chevron_right"
		size="lg"
		className="mx-auto w-full"
		onclick={() => generateScramble()}>
		{$dictionary.rubiksSettings['Generate scramble']}
	</Button>

	<Button
		variant="outline"
		animation="move-up"
		icon="info"
		size="lg"
		className="mx-auto w-full"
		onclick={() => open('rubiks-scramble-guide')}>
		{$dictionary.rubiksSettings['Scramble Guide']}
	</Button>

	<Button
		variant="outline"
		animation="move-up"
		icon="info"
		size="lg"
		className="mx-auto w-full"
		onclick={() => open('rubiks-scramble-walkthrough', { scramble: $settings.rubiks.scramble })}>
		{$dictionary.rubiksSettings['Scramble Walkthrough']}
	</Button>

	<Button
		variant="outline"
		animation="move-up"
		icon="cube"
		size="lg"
		className="mx-auto w-full"
		onclick={() => open('rubiks-interactable-cube')}>
		{$dictionary.rubiksSettings['Interactable Cube']}
	</Button>
</div>
