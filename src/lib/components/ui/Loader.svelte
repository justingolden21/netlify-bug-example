<script lang="ts">
	import { fade } from 'svelte/transition';

	import Button from '$lib/components/ui/Button.svelte';
	import { dictionary } from '$lib/stores/languageDictionary';
	import deleteDataAndReload from '$lib/util/deleteDataAndReload';

	interface Props {
		loading?: boolean;
	}

	const { loading = true }: Props = $props();

	// If loading for a long time, show delete data button
	let loadingLong = $state(false);
	setTimeout(() => (loadingLong = true), 5000);
</script>

{#if loading}
	<div
		id="loader"
		transition:fade={{ duration: 250 }}
		class="z-50 bg-base-50 dark:bg-base-900 w-full h-full fixed flex items-center justify-center">
		{#if loadingLong}
			<Button className="m-16" onclick={deleteDataAndReload}>
				{$dictionary.labels['Delete all data and reload']}
			</Button>
		{/if}

		<div
			class="w-16 h-16 rounded-full animate-spin border-8 border-base-900 border-t-transparent dark:border-base-100 dark:border-t-transparent">
		</div>
	</div>
{/if}
