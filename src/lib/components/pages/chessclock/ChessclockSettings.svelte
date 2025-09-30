<script lang="ts">
	import SettingSelect from '$lib/components/features/settings/SettingSelect.svelte';
	import ChessclockTimingDisplay from '$lib/components/pages/chessclock/ChessclockTimingDisplay.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import RangeInput from '$lib/components/ui/RangeInput.svelte';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import { chessclockTimingPresets } from '$lib/data/consts';
	import { dictionary } from '$lib/stores/languageDictionary';
	import { defaultSettings, settings } from '$lib/stores/settings';
	import playSound from '$lib/util/audioController';
	import validateInt from '$lib/util/validateInt';

	// Same as `Chessclock.svelte`
	const timerStarted = $derived($settings.chessclock.timer.lastTimestamp >= 0);

	function resetChessclockSettings() {
		// don't delete user timer
		const userTimer = JSON.parse(JSON.stringify($settings.chessclock.timer));
		$settings.chessclock = JSON.parse(JSON.stringify(defaultSettings.chessclock));
		$settings.chessclock.timer = userTimer;
	}

	// Copied from `Chessclock.svelte` - TODO dedupe
	function resetTimer() {
		$settings.chessclock.timer.currentTurn = 0;
		$settings.chessclock.timer.paused = true;
		$settings.chessclock.timer.lastTimestamp = -1;
		$settings.chessclock.timer.durations = [0, 0];
	}

	// Sound settings

	function previewSound(soundName: string) {
		playSound(soundName, 1, $settings.chessclock.sound.volume / 100);
	}

	let recentlyChangedSound: 'out' | 'switch' | 'low' = $state('out');

	// Info panels

	let displayTimingMethodInfo = $state(false);
	// commenting out simple delay since it's buggy - will be a later release
	// const timingMethods = ['none', 'fischer', 'bronstein', 'simple_delay'];
	const timingMethods = ['none', 'fischer', 'bronstein'];

	let displayKeyboardShortcutInfo = $state(false);
	const keyboardShortcuts = ['space', 'escape', 'numbers'];

	// Presets for timing methods

	// Copied from `settings.ts` - TODO dedupe
	interface TimeControl {
		startingTime: {
			min: number;
			sec: number;
		};
		increment: {
			method: 'none' | 'fischer' | 'bronstein' | 'simple_delay';
			sec: number;
		};
	}

	// Note: we can set increment to 'none' 0 and then change method and have a 0 increment
	// The code works fine, but maybe we want to change increments from 0 in the presets that have it
	function setTimeControl(timeControl: TimeControl) {
		$settings.chessclock.timeControl = timeControl;
	}
</script>

<div class="pad">
	<div class:opacity-50={timerStarted}>
		<h3 class="h4 mb-2">{$dictionary.chessclockSettings['Time control']}</h3>
		<div class="mb-4">
			<span class="label mr-2">{$dictionary.chessclockSettings['Default time:']}</span>
			<input
				disabled={timerStarted}
				class="mr-2"
				oninput={(event) => {
					event.preventDefault();
					const value = validateInt(event.currentTarget);
					// Don't allow user to set timer to 0 seconds (also see `min` of seconds input)
					if (value === 0 && $settings.chessclock.timeControl.startingTime.sec === 0) {
						$settings.chessclock.timeControl.startingTime.sec = 1;
					}
					$settings.chessclock.timeControl.startingTime.min = value;
					event.currentTarget.value = String(value);
				}}
				value={$settings.chessclock.timeControl.startingTime.min}
				type="number"
				min="0"
				max="999"
				required />
			<span class="label">:</span>
			<input
				disabled={timerStarted}
				oninput={(event) => {
					event.preventDefault();
					const value = validateInt(event.currentTarget);
					$settings.chessclock.timeControl.startingTime.sec = value;
					event.currentTarget.value = String(value);
				}}
				value={$settings.chessclock.timeControl.startingTime.sec.toString().padStart(2, '0')}
				type="number"
				min={$settings.chessclock.timeControl.startingTime.min === 0 ? '1' : '0'}
				max="59"
				required />
		</div>
		<SettingSelect
			disabled={timerStarted}
			id="time-control-method-select"
			selectLabel={$dictionary.chessclockSettings['Increment:']}
			bind:value={$settings.chessclock.timeControl.increment.method}
			values={timingMethods}
			labelMapper={(val) => $dictionary.chessclockSettings.timingMethods[val]} />
		<Button
			size="icon"
			icon="info"
			variant="ghost"
			className="inline-block ml-2 {timerStarted ? 'hidden' : ''}"
			title={$dictionary.settingsTabs['About']}
			onclick={() => (displayTimingMethodInfo = !displayTimingMethodInfo)}>
		</Button>
		{#if displayTimingMethodInfo}
			<div class="pad">
				<div class="surface pad my-4">
					{#each timingMethods as timingMethod}
						{#if timingMethod !== 'none'}
							<h3 class="h4 mt-4 mb-2 first:mt-0">
								{$dictionary.chessclockSettings.timingMethods[timingMethod]}
							</h3>
							<p class="p">{$dictionary.chessclockSettings.timingMethodInfo[timingMethod]}</p>
						{/if}
					{/each}
					<hr class="my-4" />
					<a
						href="https://en.wikipedia.org/wiki/Chess_clock#Timing_methods"
						class="a block mt-4"
						target="_blank"
						rel="noopener noreferrer">
						Wikipedia
					</a>
				</div>
			</div>
		{/if}

		<div class="mt-4" class:hidden={$settings.chessclock.timeControl.increment.method === 'none'}>
			<label for="time-control-input" class="label">
				{$dictionary.chessclockSettings['Increment:']}
			</label>
			<input
				disabled={timerStarted}
				id="time-control-input"
				oninput={(event) => {
					event.preventDefault();
					const value = validateInt(event.currentTarget);
					$settings.chessclock.timeControl.increment.sec = value;
					event.currentTarget.value = String(value);
				}}
				value={$settings.chessclock.timeControl.increment.sec}
				type="number"
				min="1"
				max="60"
				required />
		</div>

		<div class="mt-6 mb-6 hidden sm:flex flex-wrap gap-4">
			{#each chessclockTimingPresets as timingPreset}
				<Button disabled={timerStarted} onclick={() => setTimeControl(timingPreset)}>
					<ChessclockTimingDisplay timeControl={timingPreset} />
				</Button>
			{/each}
		</div>

		<!-- If time is >= 5min and wakelock can be enabled and currently isn't -->
		{#if $settings.chessclock.timeControl.startingTime.min >= 5 && 'wakeLock' in navigator && !$settings.wakeLock}
			<p class="p font-bold mt-4 bg-accent-700 text-white p-4">
				{$dictionary.chessclockSettings['wakelockReminderText']}
			</p>
		{/if}
	</div>

	<Button
		animation="move-left"
		icon="undo"
		className="block mt-4 {!timerStarted ? 'hidden' : ''}"
		onclick={resetTimer}>
		{$dictionary.chessclockSettings['New game']}
	</Button>

	<hr class="my-10" />

	<h3 class="h4 mb-2">{$dictionary.labels['Keyboard shortcuts']}</h3>

	<div class="flex items-center">
		<Toggle
			id="chessclock-shortcuts-toggle"
			bind:checked={$settings.chessclock.shortcuts.enabled}
			labelText={$dictionary.labels['Keyboard shortcuts']} />
		<Button
			size="icon"
			icon="info"
			variant="ghost"
			className="inline-block ml-2"
			title={$dictionary.settingsTabs['About']}
			onclick={() => (displayKeyboardShortcutInfo = !displayKeyboardShortcutInfo)}>
		</Button>
	</div>

	{#if displayKeyboardShortcutInfo}
		<div class="pad">
			<div class="surface pad my-4">
				{#each keyboardShortcuts as keyboardShortcut}
					<p class="p mt-2 first:mt-0">
						{$dictionary.chessclockSettings.keyboardShortcutInfo[keyboardShortcut]}
					</p>
				{/each}
			</div>
		</div>
	{/if}

	<hr class="my-10" />

	<h3 class="h4 mb-2">{$dictionary.stopwatchSettings['Display']}</h3>

	<SettingSelect
		id="flip-time-select"
		selectLabel={$dictionary.chessclockSettings['Flip time text:']}
		bind:value={$settings.chessclock.display.flipTimeText}
		values={['none', 'player0', 'player1']}
		labelMapper={(val) => $dictionary.chessclockSettings.flipOptions[val]} />

	<hr class="my-10" />

	<h3 class="h4 mb-2">{$dictionary.pomodoroSettings['Sound']}</h3>

	<Toggle
		id="sound-on-switch-toggle"
		bind:checked={$settings.chessclock.sound.soundWhenSwitch}
		labelText={$dictionary.chessclockSettings['Play sound on switch']} />

	<Toggle
		id="sound-on-low-time-toggle"
		bind:checked={$settings.chessclock.sound.soundWhenLowTime}
		labelText={$dictionary.chessclockSettings['Play sound when time is low']} />

	<Toggle
		id="sound-when-done-toggle"
		bind:checked={$settings.chessclock.sound.soundWhenDone}
		labelText={$dictionary.chessclockSettings['Play sound when time expired']} />

	<!-- TODO maybe: move sounds to consts.js and translations inside labels -->
	{#if $settings.chessclock.sound.soundWhenSwitch}
		<div class="mt-4">
			<SettingSelect
				id="chess-switch-sound-select"
				selectLabel={$dictionary.chessclockSettings['Switch sound:']}
				bind:value={$settings.chessclock.sound.switchSound}
				onchange={() => {
					previewSound($settings.chessclock.sound.switchSound);
					recentlyChangedSound = 'switch';
				}}
				values={['beep', 'beepbeep', 'decide', 'notification', 'up_down', 'wind']}
				labelMapper={(val) => $dictionary.chessclockSettings.sounds[val]} />
		</div>
	{/if}

	{#if $settings.chessclock.sound.soundWhenLowTime}
		<div class="my-4">
			<SettingSelect
				id="chess-low-time-sound-select"
				selectLabel={$dictionary.chessclockSettings['Low time sound:']}
				bind:value={$settings.chessclock.sound.lowTimeSound}
				onchange={() => {
					previewSound($settings.chessclock.sound.lowTimeSound);
					recentlyChangedSound = 'low';
				}}
				values={['beep', 'beepbeep', 'decide', 'notification', 'up_down', 'wind']}
				labelMapper={(val) => $dictionary.chessclockSettings.sounds[val]} />
		</div>

		<div>
			<label for="low-time-threshold-input" class="label">
				{$dictionary.chessclockSettings['Low time threshold:']}
			</label>
			<input
				id="low-time-threshold-input"
				oninput={(event) => {
					event.preventDefault();
					const value = validateInt(event.currentTarget);
					$settings.chessclock.sound.lowTimeThreshold = value;
					event.currentTarget.value = String(value);
				}}
				value={$settings.chessclock.sound.lowTimeThreshold}
				type="number"
				min="1"
				max="300"
				required />
		</div>
	{/if}

	{#if $settings.chessclock.sound.soundWhenDone}
		<div class="mt-4">
			<SettingSelect
				id="chess-out-of-time-sound-select"
				selectLabel={$dictionary.chessclockSettings['Out of time sound:']}
				bind:value={$settings.chessclock.sound.outOfTimeSound}
				onchange={() => {
					previewSound($settings.chessclock.sound.outOfTimeSound);
					recentlyChangedSound = 'out';
				}}
				values={['beep', 'beepbeep', 'decide', 'notification', 'up_down', 'wind']}
				labelMapper={(val) => $dictionary.chessclockSettings.sounds[val]} />
		</div>
	{/if}

	{#if $settings.chessclock.sound.soundWhenSwitch || $settings.chessclock.sound.soundWhenLowTime || $settings.chessclock.sound.soundWhenDone}
		<div class="mt-4">
			<label for="chess-volume-range" class="label">
				{$dictionary.pomodoroSettings['Volume']}
			</label>
			<RangeInput
				id="chess-volume-range"
				bind:value={$settings.chessclock.sound.volume}
				onchange={() =>
					previewSound(
						$settings.chessclock.sound[
							recentlyChangedSound === 'out'
								? 'outOfTimeSound'
								: recentlyChangedSound === 'low'
									? 'lowTimeSound'
									: 'switchSound'
						]
					)} />
		</div>
	{/if}

	<hr class="my-10" />

	<Button animation="move-left" icon="undo" onclick={resetChessclockSettings}>
		{$dictionary.chessclockSettings['Reset chess clock settings']}
	</Button>
</div>
