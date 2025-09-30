<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		doPopover?: boolean;
		trigger: import('svelte').Snippet;
		content: import('svelte').Snippet;
	}

	const { doPopover = true, trigger, content }: Props = $props();

	let isOpen = $state(false);
	let lockedOpen = $state(false);

	// `popoverRef` is assigned via `bind:this` but is not used reactively, so this is safe
	// svelte-ignore non_reactive_update
	let popoverRef: HTMLElement;
	let hoverTimeout: ReturnType<typeof setTimeout>;

	let isHovering = false;

	function toggle() {
		if (!lockedOpen) {
			lockedOpen = true;
			isOpen = true;
		} else {
			lockedOpen = false;
			isOpen = false;
		}
	}

	function show() {
		clearTimeout(hoverTimeout);
		if (!lockedOpen) isOpen = true;
		isHovering = true;
	}

	function hide() {
		isHovering = false;
		hoverTimeout = setTimeout(() => {
			if (!lockedOpen && !isHovering) {
				isOpen = false;
			}
		}, 100);
	}

	function onClickOutside(event: MouseEvent) {
		if (popoverRef && !popoverRef.contains(event.target as Node)) {
			isOpen = false;
			lockedOpen = false;
		}
	}

	onMount(() => {
		document.addEventListener('click', onClickOutside);
		return () => document.removeEventListener('click', onClickOutside);
	});
</script>

{#if doPopover}
	<div class="relative mx-auto" bind:this={popoverRef}>
		<button
			onclick={toggle}
			onfocusin={show}
			onfocusout={hide}
			onmouseenter={show}
			onmouseleave={hide}
			ontouchstart={toggle}>
			{@render trigger?.()}
		</button>

		{#if isOpen}
			<div
				role="tooltip"
				class="absolute z-10 surface mt-1 text-sm p-4"
				onmouseenter={show}
				onmouseleave={hide}>
				{@render content?.()}
			</div>
		{/if}
	</div>
{:else}
	{@render trigger?.()}
{/if}
