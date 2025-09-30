<script module lang="ts">
	import { fade } from 'svelte/transition';

	import Button from '$lib/components/ui/Button.svelte';
	import Icon, { type TIcon } from '$lib/components/ui/Icon.svelte';
	import { dictionary } from '$lib/stores/languageDictionary';
	import uid from '$lib/util/uid';

	let toasts = $state<Toast[]>([]);

	const dismissToast = (id: string) => {
		toasts = toasts.filter((t) => t.id !== id);
	};

	interface Toast {
		id: string;
		text: string;
		icon: TIcon;
		duration: number;
		dismissible: boolean;
		buttons: {
			label: string;
			dismiss: boolean;
			action: () => void;
		}[];
	}
	export function addToast({
		text = '',
		icon = 'info',
		duration = 3000,
		dismissible = true,
		buttons = []
	}: Partial<Omit<Toast, 'id'>> = {}) {
		const id = uid();
		toasts.push({ id, text, icon, duration, dismissible, buttons });
		if (duration < Infinity) {
			setTimeout(() => {
				dismissToast(id);
			}, duration);
		}
		return () => dismissToast(id);
	}
</script>

{#if toasts}
	<section
		class="z-40 w-fit mx-auto fixed inset-x-0 bottom-4 flex justify-center items-center flex-col gap-2">
		{#each toasts as toast (toast.id)}
			<div
				class="relative min-w-80 p-4 flex items-center surface"
				role="alert"
				transition:fade={{ duration: 500 }}>
				<Icon name={toast.icon} />

				<div class="ml-4 mr-2">
					{toast.text}
				</div>

				{#each toast.buttons as button}
					<Button
						className="ml-auto mx-2"
						aria-label={button.label}
						onclick={(event: Event) => {
							event.stopPropagation();
							button.action();
							if (button.dismiss) {
								dismissToast(toast.id);
							}
						}}>
						{button.label}
					</Button>
				{/each}

				{#if toast.dismissible}
					<Button
						className="ml-auto"
						variant="ghost"
						size="icon"
						icon="close"
						aria-label={$dictionary.labels['Close']}
						onclick={(event: Event) => {
							event.stopPropagation();
							dismissToast(toast.id);
						}}>
					</Button>
				{/if}

				{#if toast.duration < Infinity}
					<div
						class="progress-bar absolute bottom-0 inset-x-0 h-1 bg-base-600 dark:bg-base-200"
						style:animation-duration="{toast.duration / 1000}s">
					</div>
				{/if}
			</div>
		{/each}
	</section>
{/if}

<style>
	.progress-bar {
		animation-timing-function: linear;
		animation-name: shrink;
	}

	@keyframes shrink {
		from {
			width: 100%;
		}
		to {
			width: 0%;
		}
	}
</style>
