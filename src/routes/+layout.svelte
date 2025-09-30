<script lang="ts">
	import { onMount } from 'svelte';

	let navOpen = $state(false);
	let loading = $state(true);

	onMount(() => {
		setTimeout(() => (loading = false), 1000);
	});
</script>

<main>
	{#if !loading}
		<Header bind:navOpen />
	{/if}
</main>
