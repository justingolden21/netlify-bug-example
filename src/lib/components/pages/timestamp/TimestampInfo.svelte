<script lang="ts">
	/**
	 * Timestamp section that displays text about GMT, UTC, timestamps, and international time standards
	 */

	import { dictionary } from '$lib/stores/languageDictionary';
</script>

{#each $dictionary.timestampSettings.timestampInfo as section}
	<h2 class="h2 mt-10 first:mt-0">{section.heading}</h2>
	{#each section.body as p}
		<p class="p mt-4">{p}</p>
	{/each}
{/each}
