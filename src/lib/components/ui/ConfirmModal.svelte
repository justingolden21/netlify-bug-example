<script lang="ts">
	/**
	 * Generic confirmation modal.
	 *
	 * Pass `message`, button text, and a confirm callback via modal data
	 * when opening. Designed to be easily reused across the project.
	 */
	import Button from '$lib/components/ui/Button.svelte';
	import { close } from '$lib/util/modal.svelte';
	import type { TIcon } from '$lib/components/ui/Icon.svelte';

	interface Props {
		data: {
			message: string;
			confirmText: string;
			cancelText: string;
			onConfirm: () => void;
			confirmIcon?: TIcon;
		};
	}

	let { data = $bindable() }: Props = $props();

	// Close modal and run provided confirm callback
	function handleConfirm() {
		close();
		data.onConfirm();
	}
</script>

<div class="pad text-center">
	<p class="h3 mb-6">{data.message}</p>
	<div class="flex flex-wrap justify-center gap-4">
		<Button icon="close" variant="outline" onclick={close}>{data.cancelText}</Button>
		<Button icon={data.confirmIcon} onclick={handleConfirm}>{data.confirmText}</Button>
	</div>
</div>
