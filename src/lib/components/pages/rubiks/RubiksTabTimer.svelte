<script lang="ts">
	/**
	 * Timer used by `RubiksCubeTimer`
	 *
	 * Handles stopwatch logic
	 */

	import Button from '$lib/components/ui/Button.svelte';
	import { addToast } from '$lib/components/ui/Toast.svelte';
	import { dictionary } from '$lib/stores/languageDictionary';
	import { settings } from '$lib/stores/settings';
	import { anyModalOpen } from '$lib/util/modal.svelte';
	import { now } from '$lib/util/now.svelte';
	import { generateScramble } from '$lib/util/rubiksScrambleMap.svelte';
	import { msToStr } from '$lib/util/stopwatch';

	// Start and stop times in ms since epoch
	let msElapsed = $state(0);
	$effect(() => {
		msElapsed =
			$settings.rubiks.timer.start && $settings.rubiks.timer.stop
				? $settings.rubiks.timer.stop - $settings.rubiks.timer.start
				: $settings.rubiks.timer.start
					? now.value.valueOf() - $settings.rubiks.timer.start
					: 0;
	});

	const restartPreventionWindowMs = 500; // todo: make config setting
	const stopPreventionWindowMs = 5; // todo: make config setting

	function startStop() {
		now.update();

		const timesCount = $settings.rubiks.sessions[$settings.rubiks.currentSessionID].times.length;
		if (timesCount >= 9_999) {
			const text = $dictionary.messages['Too many times'];
			const icon = 'error';
			addToast({ text, icon });
			if (timesCount >= 10_000) {
				return;
			}
		}

		if (!$settings.rubiks.timer.start) {
			$settings.rubiks.timer.start = Date.now();
			$settings.rubiks.timer.stop = 0;
		} else {
			const newTime = {
				time: now.value.valueOf() - $settings.rubiks.timer.start,
				penalty: 0,
				scramble: $settings.rubiks.scramble,
				timestamp: $settings.rubiks.timer.start,
				dnf: false
			};

			$settings.rubiks.sessions[$settings.rubiks.currentSessionID].times.unshift(newTime);
			$settings.rubiks = $settings.rubiks;

			$settings.rubiks.timer.start = 0;
			if ($settings.rubiks.generateScrambleOnTimerStop) {
				generateScramble();
			}
			// Not 100% sure this is correct, but looked like this stop value was being used without ever being set
			$settings.rubiks.timer.stop = Date.now();
		}
	}

	// Keyboard shortcuts
	function onWindowKeyDown(e: KeyboardEvent) {
		if (anyModalOpen()) return;
		if (document.activeElement?.tagName !== 'BODY') return;

		// Space starts timer when released if not yet started, stops timer when pressed if running
		if (e.key === ' ') {
			if (!$settings.rubiks.timer.start) {
				// Don't start yet... Wait until key is released
			} else {
				// Stop if running
				if (Date.now() - $settings.rubiks.timer.stop > stopPreventionWindowMs) {
					startStop();
					/**
					 * Prevent scrolling
					 *
					 * We can only do this on `keydown`
					 * because after space has been held for a certain period of time
					 * then it will start scrolling, so `preventDefault` in `keyup`
					 * wouldn't do anything.
					 * TL;DR: This is the best we can do.
					 */
					e.preventDefault(); // prevent scrolling
				}
			}
		}
	}

	function onWindowKeyUp(e: KeyboardEvent) {
		if (anyModalOpen()) return;
		if (document.activeElement?.tagName !== 'BODY') return;

		// Space starts timer when released if not yet started, stops timer when pressed if running
		if (e.key === ' ') {
			if (!$settings.rubiks.timer.start) {
				// Start timer when key is released
				if (Date.now() - $settings.rubiks.timer.stop > restartPreventionWindowMs) {
					startStop();
				}
			}
		}
	}

	const recentTime = $derived(
		$settings.rubiks.sessions[$settings.rubiks.currentSessionID].times[0]?.time ?? 0
	);
</script>

<svelte:window onkeydown={onWindowKeyDown} onkeyup={onWindowKeyUp} />

<Button onclick={startStop} className="block h-full w-full text-center">
	<p class="w-full h1 text-[inherit] text-5xl sm:text-6xl xl:text-7xl text-center">
		{msToStr(!$settings.rubiks.timer.start ? recentTime : msElapsed, {
			alwaysShowHours: false,
			alwaysShowMinutes: false,
			digitsAfterSeconds: 3
		})}
	</p>
	<h4 class="hidden md:block h4 mt-6 text-[inherit]">
		{$dictionary.rubiksSettings['Space will start/stop the timer']}
	</h4>
</Button>
