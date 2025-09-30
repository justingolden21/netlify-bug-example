<script lang="ts">
	import { onMount } from 'svelte';

	import Button from '$lib/components/ui/Button.svelte';
	import TimezoneAutocomplete from '$lib/components/features/misc/TimezoneAutocomplete.svelte';
	import { addToast } from '$lib/components/ui/Toast.svelte';
	import { dictionary } from '$lib/stores/languageDictionary';
	import { settings } from '$lib/stores/settings';
	import { close } from '$lib/util/modal.svelte';

	interface Props {
		data?: { editIndex?: number };
	}

	let { data = $bindable({}) }: Props = $props();

	let newTimezoneName: string = $state(''),
		newTimezoneValue: string = $state('');
	const editIndex = $derived(data.editIndex ?? -1);
	const isEditMode = $derived(editIndex !== -1);

	/**
	 * By default, setting `newTimezoneValue` in `onMount` updates the value
	 * but not the `inputValue` in `Autocomplete`.
	 * Even if we set `inputValue = value` inside `onMount` in `Autocomplete`,
	 * because `onMount` runs first in the child components,
	 * it will run and not have a value before `onMount` in this component.
	 * It has to be inside `onMount` in this component because it depends on `data` and `$settings`.
	 * We can't set a listener to `value` changing inside `Autocomplete` since it would be a circular dependency.
	 * So by conditionally rendering the `Autocomplete` after this component mounted,
	 * we ensure `inputValue` is set to `value` **after** we set `newTimezoneValue` below, so the correct value is displayed.
	 */
	let loaded = $state(false);

	onMount(() => {
		if (isEditMode) {
			newTimezoneName = $settings.worldclock.timezones[editIndex].name;
			newTimezoneValue = $settings.worldclock.timezones[editIndex].zone;
		} else {
			newTimezoneValue = 'Etc/GMT';
		}

		loaded = true;
	});

	function onSubmit() {
		for (const timezone of $settings.worldclock.timezones) {
			// can't have duplicate zone and name
			// because this is the key used in the `#each` loop in `Worldclocks.svelte`
			// for correctly rehydrating the worldclocks
			if (timezone.name === newTimezoneName && timezone.zone === newTimezoneValue) {
				const text = $dictionary.messages['Cannot have duplicate timezones with same name'];
				const icon = 'error';
				addToast({ text, icon });
				return;
			}
		}

		if (!isEditMode) {
			// max 100 worldclocks
			if ($settings.worldclock.timezones.length >= 100) {
				const text = $dictionary.messages['Too many worldclocks'];
				const icon = 'error';
				addToast({ text, icon });
				return;
			}

			$settings.worldclock.timezones.push({
				zone: newTimezoneValue,
				name: newTimezoneName
			});
			$settings.worldclock.timezones = $settings.worldclock.timezones;
		} else {
			$settings.worldclock.timezones[editIndex] = {
				zone: newTimezoneValue,
				name: newTimezoneName
			};
		}

		newTimezoneName = '';
		close();
	}
</script>

<div class="pad relative h-full">
	<div class="mb-10">
		<label for="new-timezone-name-input" class="block">
			{$dictionary.worldclockSettings['Timezone nickname:']}</label>
		<input id="new-timezone-name-input" bind:value={newTimezoneName} type="text" maxlength="100" />
	</div>

	<div class="mb-10">
		{#if loaded}
			<TimezoneAutocomplete
				bind:value={newTimezoneValue}
				labelID="new-timezone-input"
				blockLabel={true} />
		{/if}
	</div>

	<Button
		icon={isEditMode ? 'check' : 'plus'}
		animation="zoom"
		className="float-right absolute bottom-6 right-6 md:bottom-10 md:right-10"
		onclick={onSubmit}>
		{$dictionary.labels[isEditMode ? 'Save' : 'Create']}
	</Button>
</div>
