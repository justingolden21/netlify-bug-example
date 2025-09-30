<script lang="ts">
	// Vector art overlay  - shown when the user does not provide location permission or coordinates

	import VectorArt from '$lib/components/features/misc/VectorArt.svelte';
	import { dictionary } from '$lib/stores/languageDictionary';
</script>

<div
	class="absolute top-0 left-0 w-full h-full z-10 bg-base-100/75 dark:bg-base-800/75 backdrop-blur-sm p-10">
	<p class="tooltip mb-10 text-center p-lg font-bold text-white bg-accent-700 p-4">
		{$dictionary.sunriseSunsetSettings['noLocationWarning']}
	</p>
	<div class="select-none w-80 xl:w-96 mx-auto mb-10">
		<VectorArt name="sunlight" />
	</div>
</div>

<style lang="postcss">
	.tooltip:after {
		content: '';
		position: absolute;
		width: 0;
		height: 0;
		border-width: 0.675rem;
		border-style: solid;
		border-color: transparent transparent theme('colors.accent-700') transparent;
		top: 1.25rem;
		left: 0;
		right: 0;
		margin-left: auto;
		margin-right: auto;
	}
</style>
