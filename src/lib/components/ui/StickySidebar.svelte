<script lang="ts">
	/**
	 * Sidebar used with `TextBlocks` in about pages
	 */

	import titleToHash from '$lib/util/titleToHash';

	interface Props {
		headings?: string[];
	}

	const { headings = [] }: Props = $props();
</script>

<ul class="space-y-2 divide-y divide-base-300 dark:divide-base-600">
	{#each headings as heading}
		{#if heading !== ''}
			<li class="pt-2">
				<a href={'#' + titleToHash(heading)} class="h4 font-light hover:underline">
					{heading}
				</a>
			</li>
		{/if}
	{/each}
</ul>
