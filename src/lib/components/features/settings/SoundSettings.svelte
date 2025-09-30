<script lang="ts">
	// reusable settings for apps that use sounds
	/**
	 * A reusable section for sound settings for a given page
	 */

	import SettingSelect from '$lib/components/features/settings/SettingSelect.svelte';
	import RangeInput from '$lib/components/ui/RangeInput.svelte';
	import { dictionary } from '$lib/stores/languageDictionary';
	import { settings } from '$lib/stores/settings';
	import playSound from '$lib/util/audioController';
	import validateInt from '$lib/util/validateInt';

	// Sound settings for this page (used to determine which `$settings` to edit)
	interface Props {
		pageName?: 'pomodoro' | 'timer' | 'countdown';
	}

	const { pageName = 'pomodoro' }: Props = $props();

	const previewSound = () =>
		playSound($settings[pageName].sound.name, 1, $settings[pageName].sound.volume / 100);
</script>

<!-- names of mp3s in static/audio -->
<SettingSelect
	id="sound-select"
	selectLabel={$dictionary.pomodoroSettings['Sound']}
	bind:value={$settings[pageName].sound.name}
	onchange={previewSound}
	values={['announcement', 'ding', 'harp', 'marimba', 'melody', 'positive']}
	labelMapper={(val) => $dictionary.pomodoroSettings.sounds[val]} />

<br />

<div class="py-6">
	<label for="volume-range" class="label">{$dictionary.pomodoroSettings['Volume']}</label>
	<RangeInput
		id="volume-range"
		bind:value={$settings[pageName].sound.volume}
		onchange={previewSound} />
</div>

<div>
	<label for="repeat-input" class="label">{$dictionary.pomodoroSettings['Repeat']}</label>
	<input
		id="repeat-input"
		oninput={(event) => {
			event.preventDefault();
			const value = validateInt(event.currentTarget);
			$settings[pageName].sound.repeat = value;
			event.currentTarget.value = String(value);
		}}
		value={$settings[pageName].sound.repeat}
		type="number"
		min="1"
		max="20"
		required />
</div>
