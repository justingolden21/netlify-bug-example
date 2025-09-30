<script lang="ts">
	/**
	 * Child component of `Timers.svelte`, used in both `/timer` and `/countdown`
	 *
	 * TODO:
	 * - different display options: show new timer/countdown on top, or only if no timers, move to modal opened by floating plus btn
	 * - implement share and url params for countdown (share btn is commented out below)
	 */

	import { onMount } from 'svelte';
	import Screenfull from 'screenfull';

	import FlipcardDisplay from '$lib/components/pages/timer/FlipcardDisplay.svelte';
	import type { Timer, Countdown } from '$lib/components/pages/timer/Timers.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { dictionary } from '$lib/stores/languageDictionary';
	import { settings } from '$lib/stores/settings';
	import playSound from '$lib/util/audioController';
	import formatTimer from '$lib/util/formatTimer';
	import getFormat from '$lib/util/getFormat';
	import getSecondsUntil from '$lib/util/getSecondsUntil';
	import { now } from '$lib/util/now.svelte';
	import { getDateTime, getUtcOffset } from '$lib/util/timeText';

	interface Props {
		timer: Timer | Countdown;
		removeItem: (timer: Timer | Countdown) => void;
		// true if it's the only timer on the page
		// results in a larger timer display if time remaining is less than 1 day
		only?: boolean;
	}

	let { timer = $bindable(), removeItem, only = false }: Props = $props();

	// in seconds
	const timeRemaining = $derived(
		timer.type === 'timer'
			? timer.duration -
					Math.ceil(
						(timer.running ? now.value.getTime() - timer.start : timer.pausedSince - timer.start) /
							1000
					)
			: (now.value, getSecondsUntil(timer.date, timer.time, timer.timezone))
	);

	const timerOver = $derived(timeRemaining <= 0);

	function handleTimerEnd() {
		timer.played = true;
		console.log('time up');
		if ($settings[timer.type].soundWhenDone) {
			playSound(
				$settings[timer.type].sound.name,
				$settings[timer.type].sound.repeat,
				$settings[timer.type].sound.volume / 100
			);
		}
	}

	$effect(() => {
		if (timerOver && !timer.played) {
			handleTimerEnd();
		}
	});

	// Fullscreen logic below - copied from `Stopwatch.svelte`

	let isFullscreen = $state(false);
	let previouslyFullscreen = false;
	onMount(() => {
		if (Screenfull.isEnabled) {
			Screenfull.on('change', () => {
				if (!Screenfull.isFullscreen) isFullscreen = false;
			});
		}
	});

	const fullscreenTimer = () => {
		isFullscreen = !isFullscreen;

		if (!Screenfull.isEnabled) return;

		if (isFullscreen) {
			previouslyFullscreen = Screenfull.isFullscreen;
			if (!Screenfull.isFullscreen) Screenfull.toggle();
		} else if (!previouslyFullscreen) {
			if (Screenfull.isFullscreen) Screenfull.toggle();
		}
	};
</script>

{#if (timer.type === 'timer' && $settings.timer.displays.primary === 'flipcard') || (timer.type === 'countdown' && $settings.countdown.displays.primary === 'flipcard')}
	<div class="w-fit mx-auto" class:fullscreen={isFullscreen} class:surface={isFullscreen}>
		<div class="flex gap-2 justify-between mb-2 z-10">
			<Button
				size="icon"
				variant="ghost"
				icon="fullscreen"
				iconSize="adaptive"
				title={$dictionary.labels['Fullscreen']}
				onclick={fullscreenTimer}>
			</Button>
			<Button
				size="icon"
				variant="ghost"
				icon="close"
				iconSize="adaptive"
				className={isFullscreen ? 'hidden' : ''}
				title={$dictionary.labels['Delete']}
				onclick={() => removeItem(timer)}>
			</Button>
		</div>
		<FlipcardDisplay
			secRemaining={timerOver ? 0 : timeRemaining}
			name={timer.name}
			{isFullscreen} />
	</div>
{:else}
	<div class="surface pad py-2" class:fullscreen={isFullscreen}>
		<div
			class="flex justify-between gap-2 sm:gap-4 lg:gap-6 py-2 border-b-2 border-base-300 dark:border-base-600">
			{#if timer.type === 'timer'}
				<Button
					size="icon"
					variant="ghost"
					icon={timer.running ? 'pause' : 'play'}
					iconSize="adaptive"
					title={$dictionary.stopwatchSettings[timer.running ? 'Start' : 'Pause']}
					onclick={() => {
						if (timer.type !== 'timer') return; // fix for ts
						if (timer.running) {
							timer.running = false;
							timer.pausedSince = Date.now();
						} else {
							// add difference between pausedSince and now to timer start to compensate for pause
							timer.start += Date.now() - timer.pausedSince;
							timer.running = true;
							timer.pausedSince = 0;
						}
					}}>
				</Button>
				<Button
					size="icon"
					variant="ghost"
					icon="undo"
					iconSize="adaptive"
					title={$dictionary.labels['Reset']}
					onclick={() => {
						if (timer.type !== 'timer') return; // fix for ts
						timer.start = Date.now();
						timer.pausedSince = timer.running ? 0 : Date.now();
					}}>
				</Button>
				<!-- Commented share button for countdowns, implement later -->
				<!-- {:else}
				<Button
					icon="share"
					variant="ghost"
					size="icon"
					iconSize="adaptive"
					aria-label={$dictionary.labels['Share']}>
				</Button> -->
			{/if}
			<Button
				size="icon"
				variant="ghost"
				icon="fullscreen"
				iconSize="adaptive"
				title={$dictionary.labels['Fullscreen']}
				onclick={fullscreenTimer}>
			</Button>
			<Button
				size="icon"
				variant="ghost"
				icon="close"
				iconSize="adaptive"
				title={$dictionary.labels['Delete']}
				className={isFullscreen ? 'hidden' : ''}
				onclick={() => removeItem(timer)}>
			</Button>
		</div>
		<div class="py-4 text-center">
			<p
				class="h1"
				class:only={only && timeRemaining < 60 * 60 * 24}
				class:text-accent-700={timerOver}
				class:dark:text-accent-700={timerOver}>
				{formatTimer(timerOver ? 0 : timeRemaining)}
			</p>
			{#if timer.name !== ''}
				<p class="p inline-block pb-1 my-4 border-b-2 border-accent-700">
					{$dictionary.timerSettings['until']}
				</p>
				<p class="h3 mb-4">{timer.name}</p>
			{/if}
			{#if timer.type === 'countdown'}
				<!-- Complex logic to make sure the user sees the date and time they entered in their timezone and format -->
				{@const [year, month, day] = timer.date?.split('-') ?? ['', '', '']}
				{@const iso8601 = `${year}-${month}-${day}T${timer.time}${getUtcOffset(
					timer.timezone ?? $settings.locale.timezone ?? 'Utc/GMT'
				)}`}
				{@const countdownDate = new Date(iso8601)}
				<!-- if timezone is picked, show time counting down to in that timezone and in user's timezone -->
				{#if timer.timezone}
					<p class="p mt-2">
						{getDateTime(countdownDate, getFormat('clock', 'date'), undefined, timer.timezone)}
						{getDateTime(countdownDate, getFormat('clock', 'time'), undefined, timer.timezone)}
						{timer.timezone.split('_').join(' ')}
						<!-- only show both timer timezone and local timezone if they are different -->
						{#if $settings.locale.timezone !== timer.timezone}
							<br />
							{getDateTime(countdownDate, getFormat('clock', 'date'))}
							{getDateTime(countdownDate, getFormat('clock', 'time'))}
							{($settings.locale.timezone ?? '').split('_').join(' ')}
						{/if}
					</p>
				{:else}
					<p class="p mt-2">
						{getDateTime(countdownDate, getFormat('clock', 'date'))}
						{getDateTime(countdownDate, getFormat('clock', 'time'))}
					</p>
				{/if}
			{/if}
		</div>
	</div>
{/if}

<style lang="postcss">
	/* if it's the only timer, make font size larger */
	.h1.only {
		@apply text-5xl sm:text-8xl md:text-7xl lg:text-8xl xl:text-10xl;
	}
	.fullscreen {
		@apply fixed left-0 top-0 z-40 flex h-screen w-screen flex-col items-center justify-center;
	}
	.fullscreen .h1,
	.fullscreen .h1.only {
		/* same font sizes as fullscreen stopwatch */
		@apply text-6xl sm:text-8xl md:text-9xl lg:text-10xl xl:text-11xl;
	}
</style>
