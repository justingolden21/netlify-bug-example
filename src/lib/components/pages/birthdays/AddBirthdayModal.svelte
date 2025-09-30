<script lang="ts">
	import { onMount } from 'svelte';

	import Button from '$lib/components/ui/Button.svelte';
	import { addToast } from '$lib/components/ui/Toast.svelte';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import { dictionary } from '$lib/stores/languageDictionary';
	import { settings } from '$lib/stores/settings';
	import { close } from '$lib/util/modal.svelte';
	import uid from '$lib/util/uid';

	interface Props {
		data: { year: number; month: number; day: number };
	}

	let { data = $bindable() }: Props = $props();

	let name: string = $state('');
	let date: string = $state('');
	let keepOpen = $state(false);

	// If data is passed in, use it to set date input
	onMount(() => {
		if (data?.day) {
			date =
				data.year +
				'-' +
				(data.month + 1).toString().padStart(2, '0') +
				'-' +
				data.day.toString().padStart(2, '0');
		}
	});

	function addBirthday() {
		// Check for too many birthdays
		if ($settings.birthdays.birthdays.length >= 2000) {
			const text = $dictionary.messages['Too many birthdays'];
			const icon = 'error';
			addToast({ text, icon });
			return;
		}

		// Add birthday
		$settings.birthdays.birthdays = [
			...$settings.birthdays.birthdays,
			{
				name,
				date,
				id: uid()
			}
		];

		// Clear inputs or close modal
		if (keepOpen) {
			name = '';
			date = '';
		} else {
			close();
		}
	}
</script>

<div class="pad grid sm:grid-cols-2 gap-4 lg:gap-6">
	<div class="sm:order-1">
		<label for="birthday-name" class="label">
			{$dictionary.pomodoroSettings['Name:']}
		</label>
		<input id="birthday-name" type="text" maxlength="50" bind:value={name} />
	</div>

	<div class="sm:order-3">
		<label for="birthday-date" class="label">
			{$dictionary.birthdaysSettings['Birthday:']}
		</label>
		<input id="birthday-date" type="date" bind:value={date} />
	</div>

	<div class="sm:order-2">
		<Toggle
			id="keep-adding-toggle"
			bind:checked={keepOpen}
			labelText={$dictionary.labels['Add another']} />
	</div>

	<Button
		icon="plus"
		animation="zoom"
		onclick={addBirthday}
		className="sm:order-5"
		disabled={name === '' || date === ''}>
		{$dictionary.birthdaysSettings['Add birthday']}
	</Button>
</div>
