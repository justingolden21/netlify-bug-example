<script lang="ts">
	// TODO: more values for timezones

	import { getKeys } from '$/types';
	import Autocomplete from '$lib/components/ui/Autocomplete.svelte';
	import timezones from '$lib/data/timezones';
	import { dictionary } from '$lib/stores/languageDictionary';

	let timezoneArr: string[] = $state([]);

	const zones = $derived(getKeys(timezones));

	// Flatten timezone groups into an array of "Region/City" strings
	function updateZones() {
		const newArr: string[] = [];
		for (const zone of zones) {
			for (const tz of timezones[zone]) {
				// rather than implement autocomplete component to support display options and actual options
				// we can just display underscores in the input
				// can update the component later, but for now this change provides value to the user
				// newArr.push((zone + '/' + tz).split('_').join(' '));
				newArr.push(zone + '/' + tz);
			}
		}
		timezoneArr = newArr;
	}
	$effect(() => {
		if (zones) updateZones();
	});

	interface Props {
		value: string;
		disabled?: boolean;
		placeholder?: string;
		labelID?: string | undefined;
		blockLabel?: boolean;
	}

	let {
		value = $bindable(),
		disabled = false,
		placeholder = '',
		labelID = undefined,
		blockLabel = false
	}: Props = $props();
</script>

{#if labelID}
	<label class="label" class:block={blockLabel} for={labelID}>
		{$dictionary.labels['Timezone:']}
	</label>
{/if}
<Autocomplete
	id={labelID}
	bind:value
	{placeholder}
	{disabled}
	options={timezoneArr}
	maxResults={undefined}
	selectOnFocus={true}
	selectOnClick={true} />
