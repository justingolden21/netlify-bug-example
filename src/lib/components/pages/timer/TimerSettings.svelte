<script lang="ts">
	import SettingSelect from '$lib/components/features/settings/SettingSelect.svelte';
	import SoundSettings from '$lib/components/features/settings/SoundSettings.svelte';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import { dictionary } from '$lib/stores/languageDictionary';
	import { settings } from '$lib/stores/settings';
</script>

<div class="pad">
	<h3 class="h4 mb-2">{$dictionary.pomodoroSettings['Sound']}</h3>

	<div class="mb-6">
		<Toggle
			id="sound-when-done-toggle"
			bind:checked={$settings.timer.soundWhenDone}
			labelText={$dictionary.chessclockSettings['Play sound when time expired']} />
	</div>

	{#if $settings.timer.soundWhenDone}
		<SoundSettings pageName="timer" />
	{/if}

	<hr class="my-10" />

	<h3 class="h4 mb-2">{$dictionary.labels['User Interface']}</h3>

	<div class="mb-2">
		<SettingSelect
			id="input-select"
			selectLabel={$dictionary.clockSettings['Primary display:']}
			bind:value={$settings.timer.displays.primary}
			values={['default', 'flipcard']}
			labelMapper={(val) => $dictionary.clockSettings.clockFormats[val]} />
	</div>

	<div class="mb-2">
		<SettingSelect
			id="input-select"
			selectLabel={$dictionary.labels['Input type:']}
			bind:value={$settings.timer.input}
			values={['numbers', 'keypad']}
			labelMapper={(val) => $dictionary.labels.Inputs[val]} />
	</div>

	{#if $settings.timer.input === 'numbers'}
		<div class="my-6">
			<Toggle
				id="days-input-toggle"
				bind:checked={$settings.timer.daysInput}
				labelText={$dictionary.timerSettings['Show days input']} />
		</div>
	{/if}
</div>
