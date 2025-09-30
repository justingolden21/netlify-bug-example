<!-- https://github.com/rsdavis/svelte-collapsible/tree/main/src/components -->
<script lang="ts">
	import { createEventDispatcher, setContext } from 'svelte';
	import { writable } from 'svelte/store';

	interface Props {
		key?: string | null;
		children: import('svelte').Snippet;
	}

	const { key = null, children }: Props = $props();

	const dispatch = createEventDispatcher();

	// create a store for the children to access
	const store = writable<{ key: string | null }>({ key });

	// when the store changes, update the key prop
	$effect(() => {
		dispatch('change', { key: $store.key });
	});

	// when the key prop changes, update the store
	$effect(() => {
		$store = { key };
	});

	// make the store available to children
	setContext('accordion', store);
</script>

<ul>
	{@render children()}
</ul>
