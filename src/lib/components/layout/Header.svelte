<script lang="ts">
	interface Props {
		navOpen: boolean;
	}

	let { navOpen = $bindable() }: Props = $props();
</script>

<header>
	{#if navOpen}
		hello
	{/if}
</header>
