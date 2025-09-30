<script lang="ts">
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';

	import Button from '$lib/components/ui/Button.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { dictionary } from '$lib/stores/languageDictionary';
	import { isEmpty } from '$lib/util/isEmpty';
	import { closeByName } from '$lib/util/modal.svelte';
	import { modalData } from '$lib/util/modalData';

	interface Props {
		name: string;
		data: any;
	}
	let { name, data }: Props = $props();
	let SvelteComponent = $derived(modalData[name].component);
	let sizeClass = modalData[name].size ?? 'small';

	let ref = $state<HTMLDialogElement>();

	onMount(() => {
		ref!.showModal();
		return () => ref!.close();
	});
</script>

<dialog
	bind:this={ref}
	aria-label={$dictionary[modalData[name].title[0]][modalData[name].title[1]]}
	onclose={() => closeByName(name)}
	class="relative isolate w-full h-full max-w-full max-h-full flex justify-center pad overflow-hidden bg-base-300/50 dark:bg-base-700/50">
	<button aria-label="close" onclick={() => closeByName(name)} class="absolute inset-0"></button>
	<div
		in:fly={{ duration: 250, y: 80 }}
		class="relative m-auto flex w-full flex-col overflow-hidden surface rounded z-10 {sizeClass}">
		<div
			class="flex justify-between items-center p-4 border-b-2 border-base-300 dark:border-base-600">
			<h2 class="h4 ml-4">
				<Icon name={modalData[name].icon} className="mr-2" />
				{$dictionary[modalData[name].title[0]][modalData[name].title[1]]}
			</h2>
			<Button
				variant="ghost"
				size="icon"
				icon="close"
				onclick={() => closeByName(name)}
				aria-label={$dictionary.labels['Close']}>
			</Button>
		</div>
		<div class="relative h-full overflow-auto">
			{#if data && !isEmpty(data)}
				<SvelteComponent bind:data />
			{:else}
				<SvelteComponent />
			{/if}
		</div>
	</div>
</dialog>

<style lang="postcss">
	.small {
		@apply h-full max-h-[48rem] max-w-3xl lg:w-3/4;
	}
	.medium {
		@apply h-full max-w-7xl xl:w-3/4;
	}
</style>
