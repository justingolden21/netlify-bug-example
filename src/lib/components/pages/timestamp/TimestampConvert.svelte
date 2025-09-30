<script lang="ts">
	/**
	 * Timestamp section that displays input and output for converting timestamps
	 *
	 * Parent of `TimestampInput` and `TimestampDisplay`
	 */

	import VectorArt from '$lib/components/features/misc/VectorArt.svelte';
	import TimestampDisplay from '$lib/components/pages/timestamp/TimestampDisplay.svelte';
	import TimestampInput from '$lib/components/pages/timestamp/TimestampInput.svelte';
	import { dictionary } from '$lib/stores/languageDictionary';

	let selectedTimestamp = $state(0);
	let timestampIsValid = $state(true);
</script>

<TimestampInput
	updateSelectedTimestamp={(v) => (selectedTimestamp = v)}
	bind:isValid={timestampIsValid} />

<div class="h-10"></div>

{#if timestampIsValid}
	<TimestampDisplay timestamp={selectedTimestamp} />
{:else}
	<p class="p-lg text-center mb-10">{$dictionary.error['Invalid input']}</p>
	<div class="select-none w-80 xl:w-96 mx-auto max-w-full">
		<VectorArt name="watch" />
	</div>
{/if}
