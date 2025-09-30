<script module lang="ts">
	export interface Option {
		hidden?: boolean;
		text: string;
		icon: TIcon;
		func: () => void;
	}
</script>

<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import { type TIcon } from '$lib/components/ui/Icon.svelte';
	import { dictionary } from '$lib/stores/languageDictionary';

	// list of objects containing dropdown options: text, icon, func
	interface Props {
		idx?: number;
		classes?: string;
		options: Option[];
	}

	const { idx = -1, classes = '', options }: Props = $props();

	let dropdownOpen = $state(false);

	function onWindowKeyDown(e: KeyboardEvent) {
		if (e.key == 'Escape') {
			dropdownOpen = false;
		}
	}
</script>

<svelte:window onkeydown={onWindowKeyDown} />

<div class="{classes} z-10 hidden group-hover:block">
	<Button
		id="dropdown-btn-${idx}"
		aria-label={$dictionary.labels['Menu']}
		variant="ghost"
		size="icon"
		icon="dots_vertical"
		onclick={() => (dropdownOpen = !dropdownOpen)}
		className="ml-auto block">
	</Button>

	<ul
		class="rounded surface mt-2 {!dropdownOpen && 'hidden'}"
		aria-labelledby="dropdown-btn-${idx}">
		{#each options as option}
			<!-- don't show up if first item or down if last item -->
			{#if !option.hidden}
				<!-- {#if !((option.text === 'Up' && idx === 0) || (option.text === 'Down' && idx === $settings.worldclock.timezones.length - 1))} -->
				<li>
					<Button
						onclick={() => {
							dropdownOpen = false;
							option.func();
						}}
						className="justify-start w-full py-2 px-4 p-sm text-left hover:bg-base-200 dark:hover:bg-base-600"
						icon={option.icon}
						variant="ghost">
						<span class="ml-2 font-normal">{$dictionary.labels[option.text]}</span>
					</Button>
				</li>
			{/if}
		{/each}
	</ul>
</div>
