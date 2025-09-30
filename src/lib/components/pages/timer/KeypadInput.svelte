<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import { dictionary } from '$lib/stores/languageDictionary';

	interface Props {
		handleKeypadStart: (name: string, totalSeconds: number) => void;
	}

	const { handleKeypadStart }: Props = $props();

	function calculateDisplayValue(input: string): string {
		let totalSeconds = parseInt(input, 10) || 0;

		const seconds = (totalSeconds % 100).toString().padStart(2, '0');
		totalSeconds = Math.floor(totalSeconds / 100);

		const minutes = (totalSeconds % 100).toString().padStart(2, '0');
		totalSeconds = Math.floor(totalSeconds / 100);

		const hours = totalSeconds.toString().padStart(2, '0');

		// todo: i18n - also have this in `Sunrise.svelte`
		// h,m,s works for en, es, fr
		// and in hi they use different numbers but would likely understand this format
		return `${hours}h ${minutes}m ${seconds}s`;
	}

	let inputStr = $state('');

	const displayValue = $derived(calculateDisplayValue(inputStr));

	function calculateTotalSeconds(displayValue: string): number {
		const [hours, minutes, seconds] = displayValue.split(/[hms]/).map(Number);
		return hours * 3600 + minutes * 60 + seconds;
	}

	const totalSeconds = $derived(calculateTotalSeconds(displayValue));

	function handleButtonClick(value: string) {
		if (value === 'backspace') {
			inputStr = inputStr.slice(0, -1);
		} else {
			inputStr += value;
		}
	}

	function onWindowKeyDown(event: KeyboardEvent) {
		if (event.key >= '0' && event.key <= '9' && !disabled) {
			handleButtonClick(event.key);
		} else if (event.key === 'Backspace') {
			handleButtonClick('backspace');
		}
	}

	let name = $state('');

	function handleClear() {
		inputStr = '';
		name = '';
	}

	const disabled = $derived(inputStr.length > 9);
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
	role="group"
	tabindex="0"
	onkeydown={onWindowKeyDown}
	class="surface grid grid-cols-3 gap-1 max-w-xl">
	<span class="text-3xl col-span-full text-right p-2">{displayValue}</span>

	{#each ['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0'] as num}
		<Button {disabled} onclick={() => handleButtonClick(num)}>{num}</Button>
	{/each}

	<Button icon="backspace" onclick={() => handleButtonClick('backspace')} />

	<Button
		variant="ghost"
		icon="chevron_left"
		onclick={handleClear}
		className="rounded-none bg-transparent">
		{$dictionary.labels['Reset']}
	</Button>

	<input type="text" maxlength="50" bind:value={name} class="!border-b-0" />

	<Button
		variant="ghost"
		icon="chevron_right"
		onclick={() => handleKeypadStart(name, totalSeconds)}
		disabled={totalSeconds === 0}
		className="rounded-none bg-transparent">
		{$dictionary.stopwatchSettings['Start']}
	</Button>
</div>
