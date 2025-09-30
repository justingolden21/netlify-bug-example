<script lang="ts">
	/**
	 * Manages display and behavior of modals using native dialog element
	 *
	 * - Renders modals based on the current state from the `modal.ts` store.
	 * - Closes modals when clicking outside of them or pressing the Escape key.
	 *
	 * Modal content, size, and title are loaded from `modalData.ts`.
	 */

	import ModalDialog from '$lib/components/ui/ModalDialog.svelte';
	import { close, modals } from '$lib/util/modal.svelte';
	import { modalData } from '$lib/util/modalData';

	function onWindowKeyDown(e: KeyboardEvent) {
		if (e.key === 'Escape') close();
	}
</script>

<svelte:window onkeydown={onWindowKeyDown} />

{#each modals.value.filter((modal) => modal.name in modalData) as { name, data } (name)}
	<ModalDialog {name} {data} />
{/each}
