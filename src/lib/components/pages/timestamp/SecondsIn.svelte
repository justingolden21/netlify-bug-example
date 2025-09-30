<script lang="ts">
	/**
	 * Timestamp section that displays a simple table of how many seconds in other units
	 */

	import { dictionary } from '$lib/stores/languageDictionary';
</script>

<h2 class="h2 mb-2">{$dictionary.timestampSettings.sectionTitles['How Many Seconds In...']}</h2>

<table class="w-full divide-y divide-base-300 dark:divide-base-600 text-sm sm:text-base">
	<tbody>
		{#each $dictionary.timestampSettings.secondsInTable as item, idx}
			{#if idx === 0}
				<tr><th>{item[0]}</th><th>{item[1]}</th></tr>
			{:else}
				<tr><td>{item[0]}</td><td>{item[1]}</td></tr>
			{/if}
		{/each}
	</tbody>
</table>

<style lang="postcss">
	td {
		@apply whitespace-nowrap px-1 py-4 lg:px-2;
	}
	th {
		text-align: left;
	}
</style>
