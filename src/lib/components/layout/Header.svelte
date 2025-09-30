<script lang="ts">
	interface Props {
		navOpen: boolean;
	}

	let { navOpen = $bindable() }: Props = $props();
</script>

<!-- Cover the page in a div with `cursor-none` that only appears when idle
to hide the cursor when idle -->
<div id="cursor-cover" class="fixed left-0 top-0 w-full h-full z-30"></div>

<header class="relative w-full print:hidden p-4">
	{#if navOpen}
		<div
			class="inline z-30 absolute w-10 ml-16
		{'md:hidden'}"
		></div>
	{/if}
</header>
