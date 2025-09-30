<script lang="ts">
	import ChessclockBackground from '$lib/components/pages/chessclock/ChessclockBackground.svelte';
	import ChessclockTimingDisplay from '$lib/components/pages/chessclock/ChessclockTimingDisplay.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { dictionary } from '$lib/stores/languageDictionary';
	import { settings } from '$lib/stores/settings';
	import playSound from '$lib/util/audioController';
	import { anyModalOpen, open } from '$lib/util/modal.svelte';
	import { now } from '$lib/util/now.svelte';
	import { msToStr } from '$lib/util/stopwatch';

	/**
	 * Future todo:
	 * fix simple delay
	 * overtime: after X moves get Y minutes
	 * option to display time history (secondary display, as table) (would need to store current somewhere)
	 * show total turns in ui (and show white vs black based on who moved first)
	 * make timing method a primary/secondary display toggle
	 * option to add time to a player (seconds number input, player number dropdown and btn to add)
	 */

	// Used to prevent sound from playing when the page loads
	const loadedTimestamp = Date.now();

	// Starting time mins and secs converted to ms
	const startingTimeMs = $derived(
		$settings.chessclock.timeControl.startingTime.min * 60 * 1000 +
			$settings.chessclock.timeControl.startingTime.sec * 1000
	);

	// Player time remaining in ms
	const getPlayerMs = (player: 0 | 1) => {
		const isSimpleDelay = $settings.chessclock.timeControl.increment.method === 'simple_delay';
		const shouldTick =
			$settings.chessclock.timer.currentTurn === player && !$settings.chessclock.timer.paused;
		const dt = Date.now() - $settings.chessclock.timer.lastTimestamp;
		const increment = shouldTick ? dt - (isSimpleDelay ? Math.max(getExtraTime(dt)) : 0) : 0;
		const time = startingTimeMs - $settings.chessclock.timer.durations[player] - increment;
		return Math.max(0, time);
	};

	// Options for `currentTimes`
	const timeDisplayOptions = {
		alwaysShowHours: false,
		digitsAfterSeconds: 3
	};

	// Displayed times to the user
	const currentTimes = $derived.by(() => {
		// Make svelte rerun this every clock tick
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		now.value;

		return (
			$settings &&
			([0, 1] as const).map((player) =>
				msToStr(timerStarted ? getPlayerMs(player) : startingTimeMs, timeDisplayOptions)
			)
		);
	});

	// Sound and other time variables
	const {
		lowTimeThreshold,
		switchSound,
		soundWhenSwitch,
		outOfTimeSound,
		lowTimeSound,
		volume,
		soundWhenLowTime,
		soundWhenDone
	} = $derived($settings.chessclock.sound);

	const player0Ms = $derived($settings && getPlayerMs(0));
	const player1Ms = $derived($settings && getPlayerMs(1));
	const isLowOnTime0 = $derived(player1Ms <= lowTimeThreshold * 1000);
	const isLowOnTime1 = $derived(player0Ms <= lowTimeThreshold * 1000);
	const timeRanout0 = $derived(player0Ms <= 0);
	const timeRanout1 = $derived(player1Ms <= 0);
	const timeRanout = $derived(player0Ms <= 0 || player1Ms <= 0);

	const _playSound = (name: string) => playSound(name, 1, volume / 100);

	$effect(() => {
		if (isLowOnTime0 && soundWhenLowTime && timerStarted && Date.now() - loadedTimestamp > 1000)
			_playSound(lowTimeSound);
	});
	$effect(() => {
		if (isLowOnTime1 && soundWhenLowTime && timerStarted && Date.now() - loadedTimestamp > 1000)
			_playSound(lowTimeSound);
	});
	$effect(() => {
		if (timeRanout0 && soundWhenDone && timerStarted && Date.now() - loadedTimestamp > 1000)
			_playSound(outOfTimeSound);
	});
	$effect(() => {
		if (timeRanout1 && soundWhenDone && timerStarted && Date.now() - loadedTimestamp > 1000)
			_playSound(outOfTimeSound);
	});

	// Get increment time to add to timer
	function getExtraTime(durationMs: number) {
		const incrementMs = $settings.chessclock.timeControl.increment.sec * 1000;

		switch ($settings.chessclock.timeControl.increment.method) {
			case 'none':
				return 0;
			case 'fischer':
				return incrementMs;
			case 'bronstein':
			case 'simple_delay':
				return Math.min(durationMs, incrementMs);
		}
	}

	// Get current increment in ms, used by `getIncrementDisplay`
	function getCurrentIncrement(playerNum: 0 | 1) {
		const incrementMs = $settings.chessclock.timeControl.increment.sec * 1000;

		switch ($settings.chessclock.timeControl.increment.method) {
			case 'none':
				return 0;
			case 'fischer':
			case 'bronstein':
				return incrementMs;
			case 'simple_delay':
				if ($settings.chessclock.timer.currentTurn !== playerNum) {
					return incrementMs;
				} else {
					// TODO: handle paused
					console.log(Date.now() - $settings.chessclock.timer.lastTimestamp);
					// Increment minus time since last timestamp, only if above 0
					return Math.max(0, incrementMs - (Date.now() - $settings.chessclock.timer.lastTimestamp));
				}
		}
	}

	// Get displayed increment (takes in milliseconds and rounds to 2 digits)
	function getIncrementDisplay(playerNum: 0 | 1) {
		return (Math.round((getCurrentIncrement(playerNum) / 1000) * 10) / 10)
			.toString()
			.padStart(2, '0');
	}

	const timerStarted = $derived($settings.chessclock.timer.lastTimestamp >= 0);

	function handleClick(action: 'playpause' | 'left' | 'right') {
		// toggle pause if playpause
		// return if not that player's turn
		// switch turns if it is that player's turn
		// if the timer hasn't started, any player can start it
		const now = Date.now();
		const currentPlayer = $settings.chessclock.timer.currentTurn;
		const durationMs = now - $settings.chessclock.timer.lastTimestamp;
		const isPaused = $settings.chessclock.timer.paused;
		const nextPlayer: 0 | 1 = action === 'left' ? 1 : 0;

		if (!timerStarted) {
			$settings.chessclock.timer.currentTurn = nextPlayer;
			$settings.chessclock.timer.paused = false;
			$settings.chessclock.timer.lastTimestamp = now;
			if (soundWhenSwitch) _playSound(switchSound);
			return;
		}

		// handles `currentTurn` and `paused` state
		switch (action) {
			case 'playpause':
				$settings.chessclock.timer.paused = !isPaused;
				if (!isPaused) {
					$settings.chessclock.timer.durations[currentPlayer] += durationMs;
					$settings.chessclock.timer.timeBetweenPause += durationMs;
				}
				break;
			case 'left':
			case 'right':
				if (isPaused || $settings.chessclock.timer.currentTurn === nextPlayer) return;
				$settings.chessclock.timer.currentTurn = nextPlayer;
				$settings.chessclock.timer.durations[currentPlayer] +=
					durationMs - getExtraTime(durationMs + $settings.chessclock.timer.timeBetweenPause);
				$settings.chessclock.timer.timeBetweenPause = 0;
				if (soundWhenSwitch) _playSound(switchSound);
				break;
		}
		$settings.chessclock.timer.lastTimestamp = now;
	}

	// Reset timer to default state
	export function resetTimer() {
		$settings.chessclock.timer.currentTurn = 0;
		$settings.chessclock.timer.paused = true;
		$settings.chessclock.timer.lastTimestamp = -1;
		$settings.chessclock.timer.durations = [0, 0];
	}

	// Keyboard shortcuts
	// These just call `handleClick`
	function onWindowKeyDown(e: KeyboardEvent) {
		// If setting disabled, something is focused, or modal is open, return
		if (!$settings.chessclock.shortcuts.enabled) return;
		if (anyModalOpen()) return;
		if (document.activeElement?.tagName !== 'BODY') return;

		// Space unpauses if paused, else switches turns
		if (e.key === ' ') {
			if ($settings.chessclock.timer.paused) {
				handleClick('playpause');
			} else if ($settings.chessclock.timer.currentTurn === 0) {
				handleClick('left');
			} else {
				handleClick('right');
			}
		}
		// Escape pauses and unpauses
		else if (e.key === 'Escape') {
			handleClick('playpause');
		}
		// 1, 2 are for left player
		else if (e.key === '1' || e.key === '2') {
			handleClick('left');
		}
		// 9, 0 are for right player
		else if (e.key === '9' || e.key === '0') {
			handleClick('right');
		}
	}
</script>

<svelte:window onkeydown={onWindowKeyDown} />

<div class="text-center mb-10">
	<div class="flex justify-center items-center gap-4 lg:gap-10">
		<Button
			disabled={!timerStarted}
			size="icon"
			icon="undo"
			animation="move-left"
			title={$dictionary.labels['Reset']}
			onclick={resetTimer}>
		</Button>

		{#if !timeRanout}
			<Button
				size="adaptiveSm"
				icon={$settings.chessclock.timer.paused ? 'play' : 'pause'}
				animation="zoom"
				className="text-3xl lg:text-4xl"
				onclick={() => handleClick('playpause')}
				title={$dictionary.stopwatchSettings[
					!$settings.chessclock.timer.paused ? 'Pause' : !timerStarted ? 'Start' : 'Resume'
				]}>
				<span class="hidden sm:inline">
					{$dictionary.stopwatchSettings[
						!$settings.chessclock.timer.paused ? 'Pause' : !timerStarted ? 'Start' : 'Resume'
					]}
				</span>
			</Button>
		{/if}

		<Button
			size="icon"
			icon="settings"
			animation="rotate-clock"
			title={$dictionary.labels['Settings']}
			onclick={() => open('chessclock-settings')}>
		</Button>
	</div>
</div>

<div class="hidden lg:grid place-content-center mt-24">
	<ChessclockBackground />
</div>
<div class="grid lg:grid-cols-2 gap-10 lg:surface lg:pad lg:rounded">
	{#each currentTimes as currentTime, idx}
		{@const flipTimeText = $settings.chessclock.display.flipTimeText}
		{@const isActive =
			!$settings.chessclock.timer.paused &&
			!timeRanout &&
			$settings.chessclock.timer.currentTurn === idx}
		<div
			class="group lg:mb-0 text-center"
			class:rotate-180={(flipTimeText === 'player0' && idx === 0) ||
				(flipTimeText === 'player1' && idx === 1)}>
			<button
				disabled={!isActive && timerStarted}
				class="{isActive
					? 'bg-accent-700'
					: 'bg-base-600'} text-base-50 h-48 sm:h-64 lg:h-80 transition-colors duration-125 block mx-auto"
				onclick={() => handleClick(idx === 0 ? 'left' : 'right')}>
				<div class="pad">
					{#if $settings.chessclock.timeControl.increment.method !== 'none'}
						<span class="block text-right text-lg sm:text-xl text-base-200 font-bold">
							{$settings.chessclock.timer && getIncrementDisplay(idx === 0 ? 0 : 1)}
						</span>
					{/if}
					<span class="text-6xl sm:text-7xl xl:text-8xl">
						{currentTime.substring(0, currentTime.length - 4)}
					</span>
					<span class="text-base sm:text-lg">{currentTime.substring(currentTime.length - 4)}</span>
				</div>
			</button>
		</div>
	{/each}
</div>

<div class="hidden sm:block">
	<hr class="my-10 mx-auto" />

	<p class="h2 text-center">
		<ChessclockTimingDisplay timeControl={$settings.chessclock.timeControl} />
	</p>
</div>
