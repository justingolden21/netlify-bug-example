<script lang="ts">
	/** TODO: stopwatch
	 * option to display laps side by side
	 */

	import Screenfull from 'screenfull';
	import { onMount } from 'svelte';

	import LineChart from '$/lib/components/features/misc/LineChart.svelte';
	import Accordion from '$lib/components/ui/Accordion.svelte';
	import AccordionPanel from '$lib/components/ui/AccordionPanel.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { dictionary } from '$lib/stores/languageDictionary';
	import { settings } from '$lib/stores/settings';
	import { now } from '$lib/util/now.svelte';
	import { getLapTimes, getNetMs, msToStr } from '$lib/util/stopwatch';

	// TODO: use from settings store settings.stopwatch.stopwatches
	interface StopwatchData {
		id: string;
		name: string;
		times: number[];
		laps: number[];
	}

	interface Props {
		data: StopwatchData;
	}

	let { data = $bindable() }: Props = $props();

	const running = $derived(data?.times.length % 2 == 1); // odd number of times
	const lapNumber = $derived(data?.laps.length + 1);
	const lapTimes = $derived(data?.laps.length ? getLapTimes(data.times, data.laps) : []);
	const currentLap = $derived.by(() => {
		// Make svelte rerun this every clock tick
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		now.value;

		return data?.laps.length
			? msToStr(lapTimes[lapTimes.length - 1].current, {
					alwaysShowHours: $settings.stopwatch.alwaysShowHours,
					alwaysShowMinutes: true,
					digitsAfterSeconds: $settings.stopwatch.digitsAfterSeconds
				})
			: '';
	});

	// spread operator to not mutate original array
	const displayedLapTimes = $derived(
		$settings.stopwatch.reverseOrderLaps ? [...lapTimes].reverse() : lapTimes
	);

	// total running time as a string, displayed to user
	const currentTime = $derived.by(() => {
		// Make svelte rerun this every clock tick
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		now.value;

		return data?.times.length
			? msToStr(getNetMs(data.times), {
					alwaysShowHours: $settings.stopwatch.alwaysShowHours,
					alwaysShowMinutes: true,
					digitsAfterSeconds: $settings.stopwatch.digitsAfterSeconds
				})
			: '00:00';
	});

	let lineChartData: number[][] = $state([]);
	// We use this wrapper function to limit how often we have to redraw the chart
	function updateLineChartData() {
		lineChartData = [[...lapTimes.map((l) => l.total)], [...lapTimes.map((l) => l.current)]];
	}

	let isFullscreen = $state(false);
	let previouslyFullscreen = false;

	onMount(() => {
		// if the user exits fullscreen, exit fullscreen stopwatch
		if (Screenfull.isEnabled) {
			Screenfull.on('change', () => {
				if (!Screenfull.isFullscreen) isFullscreen = false;
			});
		}

		const itvl = setInterval(updateLineChartData, 100);
		return () => clearInterval(itvl);
	});

	let startButton = $state() as HTMLButtonElement;

	const toggleStart = () => {
		data.times = [...data.times, Date.now()];

		startButton.focus();

		saveStopwatch();
	};

	const addLap = () => {
		// TODO: max 1000 laps?
		data.laps = [...data.laps, Date.now()];

		updateLineChartData();

		saveStopwatch();
	};

	const removeStopwatch = () => {
		$settings.stopwatch.stopwatches = $settings.stopwatch.stopwatches.filter(
			(s) => s.id !== data.id
		);
	};

	const fullscreenStopwatch = () => {
		isFullscreen = !isFullscreen;

		if (!Screenfull.isEnabled) return;

		if (isFullscreen) {
			previouslyFullscreen = Screenfull.isFullscreen;
			// enter fullscreen if not fullscreen
			if (!Screenfull.isFullscreen) Screenfull.toggle();
		} else if (!previouslyFullscreen) {
			// restore to normal if was previously not fullscreen
			if (Screenfull.isFullscreen) Screenfull.toggle();
		}
	};

	const resetStopwatch = () => {
		data.laps = [];
		data.times = [];

		saveStopwatch();
	};

	const saveStopwatch = () => {
		// Save data
		$settings.stopwatch.stopwatches = $settings.stopwatch.stopwatches;
	};
</script>

<div
	class="stopwatch__outer surface group/stopwatches {isFullscreen &&
		'fullscreen'} h-full flex flex-col gap-4 pt-4">
	<Button
		size="icon"
		variant="ghost"
		icon="close"
		className="top-2 left-2 absolute hidden {!isFullscreen && 'group-hover/stopwatches:block'}"
		onclick={removeStopwatch}>
	</Button>
	<Button
		size="icon"
		variant="ghost"
		icon="fullscreen"
		className="top-2 right-2 {isFullscreen &&
			'w-16 h-16'} absolute hidden group-hover/stopwatches:block"
		onclick={fullscreenStopwatch}>
	</Button>
	{#if $settings.stopwatch.namableStopwatches}
		<input
			bind:value={data.name}
			onchange={saveStopwatch}
			type="text"
			class="stopwatch__name"
			maxlength="100" />
	{/if}

	<button class="stopwatch" onclick={toggleStart}>
		<div class="stopwatch__inner">
			<p class="top-text p-lg font-normal">{currentLap}</p>
			<p class="middle-text h1 font-light">{currentTime}</p>
			{#if lapNumber > 1}
				<p class="bottom-text p-lg font-normal">
					{$dictionary.stopwatchSettings['LapNumber']}
					{lapNumber}
				</p>
			{/if}
		</div>
	</button>
	<div class="stopwatch__bottom">
		<div class="grid grid-cols-2 gap-4">
			<Button
				icon={running ? 'pause' : 'play'}
				animation="zoom"
				bind:ref={startButton}
				className="text-white bg-accent-700 {!running && !$settings.stopwatch.showResetButton
					? 'col-span-full'
					: ''} {isFullscreen && 'h-16'}"
				onclick={toggleStart}>
				{$dictionary.stopwatchSettings[running ? 'Pause' : data.times.length ? 'Resume' : 'Start']}
			</Button>
			<Button
				icon="plus"
				animation="zoom"
				className="{running ? '' : 'hidden'} {isFullscreen && 'h-16'}"
				onclick={addLap}>
				{$dictionary.stopwatchSettings['Lap']}
			</Button>
			<Button
				icon="undo"
				animation="move-left"
				className="{!running && $settings.stopwatch.showResetButton
					? ''
					: 'hidden'} {isFullscreen && 'h-16'}"
				onclick={resetStopwatch}>
				{$dictionary.labels['Reset']}
			</Button>
		</div>
		{#if lapNumber > 1}
			<div class="mt-4">
				<Accordion>
					<AccordionPanel
						accordionTitle={$dictionary.stopwatchSettings['Laps']}
						key="1"
						pad={false}>
						{#if $settings.stopwatch.showLapsChart}
							<div class="p-4">
								<LineChart data={lineChartData} width={undefined} height={100} />
							</div>
						{/if}
						<!-- div wrapping table so we can have overflow scroll and the alignment of display:table
							https://stackoverflow.com/a/29156151/4907950 -->
						<div class="stopwatch__laps">
							<table class="p">
								<thead>
									<tr>
										<th>{$dictionary.stopwatchSettings['Lap']}</th>
										<th>{$dictionary.stopwatchSettings['Time']}</th>
										<th>{$dictionary.stopwatchSettings['Total']}</th>
									</tr>
								</thead>
								<tbody>
									{#each displayedLapTimes as lapTime, idx}
										<tr>
											<td>
												{$settings.stopwatch.reverseOrderLaps
													? displayedLapTimes.length - idx
													: idx + 1}
											</td>
											<td>
												{msToStr(lapTime.current, {
													alwaysShowHours: false,
													alwaysShowMinutes: true,
													digitsAfterSeconds: $settings.stopwatch.digitsAfterSecondsLapList
												})}
											</td>
											<td>
												{msToStr(lapTime.total, {
													alwaysShowHours: false,
													alwaysShowMinutes: true,
													digitsAfterSeconds: $settings.stopwatch.digitsAfterSecondsLapList
												})}
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</AccordionPanel>
				</Accordion>
			</div>
		{/if}
	</div>
</div>

<style lang="postcss">
	.stopwatch__outer {
		@apply relative overflow-hidden text-center align-top;
	}
	.stopwatch__outer.fullscreen {
		/* TODO: `items-start` when lap details are open */
		@apply fixed left-0 top-0 z-40 flex h-screen w-screen items-center justify-center;
	}
	.stopwatch {
		@apply m-auto inline-block h-48 w-48 cursor-pointer rounded-full bg-base-200 p-4 hover:bg-base-300;
	}
	.fullscreen .stopwatch {
		@apply h-[16rem] w-[16rem] sm:h-[28rem] sm:w-[28rem] md:h-[32rem] md:w-[32rem] lg:h-[36rem] lg:w-[36rem] xl:h-[40rem] xl:w-[40rem];
	}
	:global(.dark) .stopwatch {
		@apply bg-base-700 hover:bg-base-600;
	}
	.stopwatch__name {
		@apply mx-auto block w-1/2 border-2 border-transparent bg-transparent text-center group-hover/stopwatches:border-base-300;
	}
	:global(.dark) .stopwatch__name {
		@apply bg-transparent text-base-200;
	}
	:global(.dark) .group\/stopwatches:hover .stopwatch__name {
		@apply border-base-600;
	}
	.stopwatch__inner {
		@apply relative h-full w-full select-none;
	}
	.top-text,
	.middle-text,
	.bottom-text {
		@apply w-full text-center;
	}
	.top-text,
	.bottom-text {
		@apply absolute;
	}
	.fullscreen .top-text,
	.fullscreen .bottom-text {
		@apply text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl;
	}
	.top-text {
		@apply top-2;
	}
	.bottom-text {
		@apply bottom-2;
	}
	.middle-text {
		@apply relative top-1/2 -translate-y-1/2;
	}
	.fullscreen .middle-text {
		@apply text-6xl sm:text-8xl md:text-9xl lg:text-10xl xl:text-11xl;
	}
	/* https://stackoverflow.com/a/28233945/4907950 */
	.top-text:before,
	.middle-text:before,
	.bottom-text:before {
		content: '';
		margin-left: -100%;
	}
	.top-text:after,
	.middle-text:after,
	.bottom-text:after {
		content: '';
		margin-right: -100%;
	}
	.fullscreen .stopwatch__name {
		@apply hidden;
	}
	.fullscreen .stopwatch__bottom {
		@apply w-full;
	}
	.stopwatch__laps {
		@apply max-h-64 overflow-auto;
	}
	.fullscreen .stopwatch__laps {
		@apply bg-base-300/50;
	}
	:global(.dark) .fullscreen .stopwatch__laps {
		@apply bg-base-700/50;
	}
</style>
