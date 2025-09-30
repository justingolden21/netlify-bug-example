<script lang="ts">
	import SettingSelect from '$lib/components/features/settings/SettingSelect.svelte';
	import SoundSettings from '$lib/components/features/settings/SoundSettings.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import { pomodoroStates } from '$lib/data/consts';
	import { dictionary } from '$lib/stores/languageDictionary';
	import { defaultSettings, settings } from '$lib/stores/settings';
	import validateInt from '$lib/util/validateInt';
	import getTranslatedTimefield from '$lib/util/getTranslatedTimefield';

	const resetPomodoroSettings = () => {
		// don't delete user's timers
		const userTimers = JSON.parse(JSON.stringify($settings.pomodoro.timer));
		$settings.pomodoro = JSON.parse(JSON.stringify(defaultSettings.pomodoro));
		$settings.pomodoro.timer = userTimers;
	};

	const locale = $derived($settings.locale.language ?? 'en');
</script>

<div class="pad">
	<h3 class="h4 mb-2">{$dictionary.clockSettings['Displays']}</h3>

	<div class="mb-4">
		<SettingSelect
			id="primary-display-select"
			selectLabel={$dictionary.clockSettings['Primary display:']}
			bind:value={$settings.pomodoro.displays.primary}
			values={['just_timer', 'combined', 'split']}
			labels={$dictionary.clockSettings.clockFormats} />
	</div>

	<div>
		<SettingSelect
			id="secondary-display-select"
			selectLabel={$dictionary.clockSettings['Secondary display:']}
			bind:value={$settings.pomodoro.displays.secondary}
			values={['task_list', 'both', 'overview', 'none']}
			labels={$dictionary.clockSettings.clockFormats} />
	</div>

	<hr class="my-10" />

	<h3 class="h4 mb-2">{getTranslatedTimefield(locale, 'minute', true, true)}</h3>

	<div class="grid gap-4 lg:gap-6 lg:grid-cols-2">
		{#each pomodoroStates as timeConfig}
			<div>
				<label for="{timeConfig}-minutes-input" class="label"
					>{$dictionary.pomodoroSettings.sections[timeConfig]}</label>
				<input
					id="{timeConfig}-minutes-input"
					oninput={(event) => {
						event.preventDefault();
						const value = validateInt(event.currentTarget);
						$settings.pomodoro.minutes[timeConfig] = value;
						event.currentTarget.value = String(value);
					}}
					value={$settings.pomodoro.minutes[timeConfig]}
					type="number"
					min="1"
					max="300"
					required />
			</div>
		{/each}
		<div>
			<label for="long-break-interval-input" class="label">
				{$dictionary.pomodoroSettings['Long break interval']}</label>
			<input
				id="long-break-interval-input"
				oninput={(event) => {
					event.preventDefault();
					const value = validateInt(event.currentTarget);
					$settings.pomodoro.minutes.longBreakInterval = value;
					event.currentTarget.value = String(value);
				}}
				value={$settings.pomodoro.minutes.longBreakInterval}
				type="number"
				min="1"
				max="20"
				required />
		</div>
	</div>

	<hr class="my-10" />

	<h3 class="h4 mb-2">{$dictionary.pomodoroSettings['Automatic start']}</h3>

	<Toggle
		id="auto-start-breaks-toggle"
		bind:checked={$settings.pomodoro.autoStartBreaks}
		labelText={$dictionary.pomodoroSettings['Auto start breaks']} />

	<Toggle
		id="auto-start-pomodoros-toggle"
		bind:checked={$settings.pomodoro.autoStartPomodoros}
		labelText={$dictionary.pomodoroSettings['Auto start pomodoros']} />

	<hr class="my-10" />

	<h3 class="h4 mb-2">{$dictionary.pomodoroSettings['Sound']}</h3>

	<SoundSettings pageName="pomodoro" />

	<hr class="my-10" />

	<Button animation="move-left" icon="undo" onclick={resetPomodoroSettings}>
		{$dictionary.pomodoroSettings['Reset pomodoro settings']}
	</Button>
</div>
