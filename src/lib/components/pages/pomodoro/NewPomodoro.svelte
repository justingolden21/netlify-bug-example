<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import { addToast } from '$lib/components/ui/Toast.svelte';
	import { dictionary } from '$lib/stores/languageDictionary';
	import { settings } from '$lib/stores/settings';
	import { close } from '$lib/util/modal.svelte';
	import uid from '$lib/util/uid';
	import validateInt from '$lib/util/validateInt';
	import getTranslatedTimefield from '$lib/util/getTranslatedTimefield';

	let newPomodoroName = $state(''),
		newPomodoroDescription = $state(''),
		newPomodoroPoms = $state(1);

	const locale = $derived($settings.locale.language ?? 'en');

	function onSubmit() {
		// max 50 tasks
		if ($settings.pomodoro.timer.tasks.length >= 50) {
			const text = $dictionary.messages['Too many pomodoros'];
			const icon = 'error';
			addToast({ text, icon });
			return;
		}
		const id = uid();

		$settings.pomodoro.timer.tasks.push({
			name: newPomodoroName ?? '',
			description: newPomodoroDescription ?? '',
			poms: newPomodoroPoms ?? 1,
			id: id,
			complete: false
		});
		$settings.pomodoro.timer.tasks = $settings.pomodoro.timer.tasks;

		if ($settings.pomodoro.timer.activeTaskID === '') {
			$settings.pomodoro.timer.activeTaskID = id;
		}

		newPomodoroName = '';
		newPomodoroDescription = '';
		newPomodoroPoms = 1;
		close();
	}
</script>

<div class="pad relative h-full">
	<div class="mb-10">
		<label for="new-pomodoro-name-input" class="label block mb-1">
			{$dictionary.pomodoroSettings['Name:']}
		</label>
		<input id="new-pomodoro-name-input" bind:value={newPomodoroName} type="text" maxlength="40" />
	</div>

	<div class="mb-10">
		<label for="new-pomodoro-description-input" class="label block mb-1">
			{$dictionary.pomodoroSettings['Description:']}
		</label>
		<input
			id="new-pomodoro-description-input"
			bind:value={newPomodoroDescription}
			type="text"
			maxlength="200" />
	</div>

	<div class="mb-16">
		<label for="new-pomodoro-poms-input" class="label">
			{$dictionary.pomodoroSettings['Poms:']}
		</label>
		<input
			id="new-pomodoro-poms-input"
			oninput={(event) => {
				event.preventDefault();
				const value = validateInt(event.currentTarget);
				newPomodoroPoms = value;
				event.currentTarget.value = String(value);
			}}
			value={newPomodoroPoms}
			type="number"
			min="1"
			max="20"
			required />
		<span class="p-sm ml-2">
			({newPomodoroPoms * $settings.pomodoro.minutes.pomodoro}
			{getTranslatedTimefield(locale, 'minute', true)})
		</span>
		<p class="p-sm mt-2">
			{$dictionary.pomodoroSettings['How many pomodoros the task will take to complete']}
		</p>

		<Button
			animation="zoom"
			icon="plus"
			className="float-right absolute bottom-6 right-6 md:bottom-10 md:right-10"
			onclick={onSubmit}>
			{$dictionary.labels['Create']}
		</Button>
	</div>
</div>
