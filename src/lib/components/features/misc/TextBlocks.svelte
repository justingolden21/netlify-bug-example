<script module lang="ts">
	/**
	 * Renders an array of text items with titles and paragraphs
	 *
	 * Used by changelogs and about
	 */

	export interface TextItem {
		paragraph: string;
		title: string;
	}
</script>

<script lang="ts">
	import titleToHash from '$lib/util/titleToHash';

	interface Props {
		items: TextItem[];
	}

	const { items }: Props = $props();

	// Replace URLs with anchor tags
	function createLinks(text: string) {
		/**
		 * Regex matches URLs in text
		 *
		 * Match "http" with or without "s"
		 * Match "://"
		 * Match non whitespace characters
		 * Match period "."
		 * Match non whitespace characters
		 * Match word character (alphanumeric or underscore)
		 */
		const urlRegex = /https?:\/\/[^\s/$.?#].[^\s]*\w/g;
		return text.replace(
			urlRegex,
			(url) => `<a href="${url}" target="_blank" rel="noopener noreferrer" class="a">${url}</a>`
		);
	}
</script>

<div>
	{#each items as item}
		<div class="pb-6 last:pb-0">
			{#if item.title}
				<h3
					class="{item.paragraph ? 'h3' : 'h2 font-light'} mt-6 mb-2"
					id={titleToHash(item.title)}>
					{item.title}
				</h3>
			{/if}
			{#if item.paragraph}
				<p class="p-lg">
					{@html createLinks(item.paragraph)}
				</p>
			{/if}
		</div>
	{/each}
</div>
