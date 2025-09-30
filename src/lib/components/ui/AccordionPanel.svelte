<script lang="ts">
	import { getContext } from 'svelte';
	import type { Writable } from 'svelte/store';

	import Icon from '$lib/components/ui/Icon.svelte';

	interface Props {
		accordionTitle: string;
		key: string;
		pad?: boolean;
		children: import('svelte').Snippet;
	}

	const { accordionTitle, key, pad = true, children }: Props = $props();
	const store = getContext<Writable<{ key: string | null }>>('accordion');
	const open = $derived($store.key === key);

	function handleToggle() {
		$store = { key: open ? null : key };
	}
</script>

<div class="details">
	<button class="details__summary p" onclick={handleToggle} aria-expanded={open}>
		<Icon
			size="sm"
			name="chevron_right"
			className="mr-2 transition-transform duration-125 {open ? 'rotate-90' : ''}" />
		{accordionTitle}
	</button>

	<div class="details__content" class:pad class:open>
		{@render children()}
	</div>
</div>

<style global lang="postcss">
	.details:not(:first-child) {
		@apply border-t-2 border-base-300 dark:border-base-600;
	}

	.details__summary.p {
		@apply w-full cursor-pointer bg-base-100 bg-opacity-25 p-2 text-left font-normal hover:bg-base-200 focus-visible:bg-base-200;
	}
	:global(.dark) .details__summary {
		@apply bg-base-700 hover:bg-base-600 focus-visible:bg-base-600;
	}

	.details__content {
		@apply hidden;
	}
	.details__content.open {
		@apply block;
		animation: sweep 0.25s ease-out;
	}

	@keyframes sweep {
		from {
			opacity: 0;
			transform: translateY(-1rem);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
