<script>
	import Header from '$/lib/components/layout/Header.svelte';

	let navOpen = $state(false);

	const { children } = $props();
</script>

<Header {navOpen} />

{@render children()}
