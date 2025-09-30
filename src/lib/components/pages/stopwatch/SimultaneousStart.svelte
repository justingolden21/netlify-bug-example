<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import { addToast } from '$lib/components/ui/Toast.svelte';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import { dictionary } from '$lib/stores/languageDictionary';
	import { settings } from '$lib/stores/settings';
	import checkTooManyStopwatches from '$lib/util/checkTooManyStopwatches';
	import { close } from '$lib/util/modal.svelte';
	import uid from '$lib/util/uid';
	import validateInt from '$lib/util/validateInt';

	let numberSimultaneous = $state(2);
	let enteringNames = $state(false);
	let stopwatchNames = $state('');

	function onSubmit() {
		const names = stopwatchNames
			.split('\n')
			.map((s) => s.trim())
			.filter((s) => s !== '');
		const numberToMake = enteringNames ? names.length : numberSimultaneous;

		const tooMany = checkTooManyStopwatches(
			$dictionary,
			$settings.stopwatch.stopwatches.length,
			numberToMake
		);
		if (tooMany) return;

		if (numberToMake === 0) {
			const text = $dictionary.messages['Please enter at least 1 name'];
			const icon = 'error';
			addToast({ text, icon });
			return;
		}

		// setting the first time to current timestamp starts the stopwatches
		const newStopwatches = Array.from({ length: numberToMake }, (_, idx) => ({
			times: [Date.now()],
			laps: [],
			id: uid(),
			name: enteringNames ? names[idx] : ''
		}));

		$settings.stopwatch.stopwatches = [...$settings.stopwatch.stopwatches, ...newStopwatches];

		// in case it isn't enabled/shown to user
		if (enteringNames) {
			$settings.stopwatch.namableStopwatches = true;
		}

		close();
	}
</script>

<div class="pad relative h-full">
	<Toggle
		id="name-simultaneous-stopwatches-toggle"
		bind:checked={enteringNames}
		labelText={$dictionary.stopwatchSettings['Enter list of names']} />

	{#if enteringNames}
		<label for="simultaneous-stopwatch-textarea" class="block mb-1">
			{$dictionary.stopwatchSettings['Names (one per line):']}
		</label>
		<textarea
			id="simultaneous-stopwatch-textarea"
			bind:value={stopwatchNames}
			class="w-full"
			rows="8"></textarea>
	{:else}
		<label for="simultaneous-stopwatches-input" class="label block mb-1">
			{$dictionary.stopwatchSettings['Number of stopwatches to start at the same time:']}</label>
		<input
			id="simultaneous-stopwatches-input"
			oninput={(event) => {
				event.preventDefault();
				const value = validateInt(event.currentTarget);
				numberSimultaneous = value;
				event.currentTarget.value = String(value);
			}}
			value={numberSimultaneous}
			type="number"
			min="1"
			max="25" />
	{/if}

	<Button
		animation="move-right"
		icon="stopwatch"
		size="lg"
		className="float-right absolute bottom-6 right-6 md:bottom-10 md:right-10"
		onclick={onSubmit}>
		{$dictionary.stopwatchSettings['Start']}
	</Button>
</div>
