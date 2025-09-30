<script lang="ts">
	import Header from '$/lib/components/layout/Header.svelte';

	let navOpen = $state(false);

	interface Props {
		children: import('svelte').Snippet;
	}
	const { children }: Props = $props();
</script>

<main>
	<Header bind:navOpen />

	{@render children()}
</main>
