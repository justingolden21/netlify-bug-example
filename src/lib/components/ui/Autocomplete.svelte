<script lang="ts">
	import clickOutside from '$lib/util/clickOutside';

	// Enforces the type is consistent between `options` and `onchange`
	type T = $$Generic;

	interface Props {
		options: (T & string & unknown)[];
		placeholder?: string;
		value?: (typeof options)[number] | '';
		disabled?: boolean;
		closeOnClickAway?: boolean;
		id?: string;
		selectOnClick?: boolean;
		selectOnFocus?: boolean;
		onchange?: ((value: (typeof options)[number]) => void) | undefined;
		displayPreview?: boolean;
		title?: string;
		// min characters in input for autocomplete to appear
		minChars?: number;
		// max results to show at a time
		maxResults?: number;
	}

	let {
		options,
		placeholder = '',
		value = $bindable(''),
		disabled = false,
		closeOnClickAway = true,
		id = '',
		selectOnClick = false,
		selectOnFocus = false,
		onchange = undefined,
		displayPreview = true,
		title = '',
		minChars = 2,
		maxResults = 20
	}: Props = $props();

	// filter options based on input
	let filteredOptions: string[] = $state([]);

	/**
	 * inputValue is the value used for the component
	 * we export a value back to the consumer only if it's valid (if it's included in the given options)
	 *
	 * make new variable for inputValue and on inputValue change set value to it only if it's one of the options
	 */
	let inputValue: string = $state(value);

	const updateInputValue = (value: string) => (inputValue = value);

	const isValidOption = (value: string): value is (typeof options)[number] =>
		options.includes(value as any);

	const splitStringThree = (str: string, idx0: number, idx1: number, idx2: number) =>
		[str.substring(idx0, idx1), str.substring(idx1, idx2), str.substring(idx2)] as const;

	const removeBold = (str: string) => str?.replace(/<(strong)>/g, '').replace(/<\/(strong)>/g, '');

	const filterOptions = () => {
		if (isValidOption(inputValue)) value = inputValue;
		if (!inputValue || inputValue.length < minChars) {
			filteredOptions = [];
			highlightIdx = null;
			return;
		}
		const newOptions = [];
		let numResults = 0;
		for (const option of options) {
			const foundIdx = option
				.replace(/ /g, '_')
				.toLowerCase()
				.indexOf(inputValue.replace(/ /g, '_').toLowerCase());
			if (foundIdx !== -1) {
				const splitString = splitStringThree(option, 0, foundIdx, foundIdx + inputValue.length);
				const boldString = `${splitString[0]}<strong>${splitString[1]}</strong>${splitString[2]}`;
				newOptions.push(boldString);

				numResults++;
				if (maxResults && numResults >= maxResults) {
					break;
				}
			}
		}
		filteredOptions = newOptions;
	};

	// handle user input

	let searchInput = $state() as HTMLInputElement;

	const setInputVal = (optionName: string) => {
		inputValue = removeBold(optionName);
		if (isValidOption(inputValue)) value = inputValue;
		filteredOptions = [];
		highlightIdx = null;
		searchInput.focus();
	};

	// use keyboard to navigate and highlight options

	let highlightIdx: number | null = $state(null);

	const navigateList = (e: KeyboardEvent) => {
		// if autocomplete input is not focused, return
		if (document.activeElement !== searchInput) return;

		if (e.key === 'ArrowDown') {
			if (highlightIdx === null) {
				highlightIdx = 0;
			} else {
				highlightIdx++;
			}
		} else if (e.key === 'ArrowUp') {
			if (highlightIdx === null) {
				highlightIdx = filteredOptions.length - 1;
			} else {
				highlightIdx--;
			}
		} else if (e.key === 'Enter' && filteredOptions.length > 0) {
			if (highlightIdx !== null) {
				setInputVal(filteredOptions[highlightIdx]);
			} else if (filteredOptions) {
				setInputVal(filteredOptions[0]);
			}
		} else if (e.key === 'Escape') {
			filteredOptions = [];
		}

		if (highlightIdx !== null) {
			if (highlightIdx >= filteredOptions.length) highlightIdx = 0;
			if (highlightIdx < 0) highlightIdx = filteredOptions.length - 1;
			document.querySelectorAll('.autocomplete-item')[highlightIdx]?.scrollIntoView();
		}
	};
	$effect(() => {
		updateInputValue(value);
	});
	$effect(() => {
		if (value) {
			onchange?.(value);
		}
	});
</script>

<svelte:window onkeydown={navigateList} />

<div class="relative inline-block w-64">
	{#if displayPreview}
		<p class="p-sm">{value}</p>
	{/if}
	<input
		{id}
		title={title !== '' ? title : undefined}
		spellcheck="false"
		autocomplete="off"
		type="text"
		class="w-full"
		{disabled}
		{placeholder}
		bind:this={searchInput}
		bind:value={inputValue}
		oninput={filterOptions}
		onfocus={(event) => selectOnFocus && event.currentTarget.select()}
		onclick={(event) => selectOnClick && event.currentTarget.select()} />
	{#if filteredOptions.length > 0}
		<ul
			class="absolute min-w-full max-h-64 overflow-y-auto z-10"
			use:clickOutside={() => {
				if (closeOnClickAway) filteredOptions = [];
			}}>
			{#each filteredOptions as option, i}
				<li class="contents">
					<button
						class="block autocomplete-item p-2 cursor-pointer border-2 border-t-0 border-base-300 dark:border-base-600
							hover:bg-accent-700 dark:hover:bg-accent-700 hover:text-base-50 {i === highlightIdx
							? 'bg-accent-900 text-base-50 dark:bg-accent-900 dark:text-base-50'
							: 'bg-base-50 dark:bg-base-700'} w-full text-left"
						onclick={() => setInputVal(option)}>
						{@html option}
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>
