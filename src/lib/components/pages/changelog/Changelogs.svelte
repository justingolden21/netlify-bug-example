<script lang="ts">
	import TextBlocks, { type TextItem } from '$lib/components/features/misc/TextBlocks.svelte';

	interface Props {
		changelogs?: TextItem[];
	}

	const { changelogs = [] }: Props = $props();
</script>

<TextBlocks items={changelogs} />
