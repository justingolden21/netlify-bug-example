<script lang="ts">
	import { fade, fly, scale } from 'svelte/transition';

	import NoTasks from '$lib/components/pages/pomodoro/NoTasks.svelte';
	import PomodoroOverview from '$lib/components/pages/pomodoro/PomodoroOverview.svelte';
	import TomatoTimerSvg from '$lib/components/pages/pomodoro/TomatoTimerSvg.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Tabs, { type Tab } from '$lib/components/ui/Tabs.svelte';
	import { dictionary } from '$lib/stores/languageDictionary';
	import { settings } from '$lib/stores/settings';
	import playSound from '$lib/util/audioController';
	import { open } from '$lib/util/modal.svelte';
	import { now } from '$lib/util/now.svelte';
	import { getNetMs, msToStr } from '$lib/util/stopwatch';

	const timerNames = ['pomodoro', 'shortBreak', 'longBreak'] as const;

	const tabData = $derived(
		timerNames.map((option) => {
			return {
				name: $dictionary.pomodoroSettings.sections[option],
				onclick: () => {
					onSkip();
					$settings.pomodoro.timer.activeTab = option;
				}
			};
		}) as Tab[]
	);

	const activeTask = $derived(
		$settings.pomodoro.timer.activeTaskID !== ''
			? $settings.pomodoro.timer.tasks.find((t) => t.id === $settings.pomodoro.timer.activeTaskID)
			: null
	);
	const activeIdx = $derived(
		$settings.pomodoro.timer.tasks.findIndex((t) => t.id === $settings.pomodoro.timer.activeTaskID)
	);

	const removeTask = (id: string) => {
		if (id === $settings.pomodoro.timer.activeTaskID) {
			if ($settings.pomodoro.timer.tasks.length > activeIdx + 1) {
				$settings.pomodoro.timer.activeTaskID = $settings.pomodoro.timer.tasks[activeIdx + 1].id;
			} else {
				$settings.pomodoro.timer.activeTaskID = '';
			}
			$settings.pomodoro.timer.activeTaskProgress = 0;
		}
		$settings.pomodoro.timer.tasks = $settings.pomodoro.timer.tasks.filter((t) => t.id !== id);
	};

	const deleteAll = () => {
		$settings.pomodoro.timer.activeTaskID = '';
		$settings.pomodoro.timer.tasks = [];
	};

	const startAtBeginning = () => {
		$settings.pomodoro.timer.tasks.forEach((t) => (t.complete = false));
		$settings.pomodoro.timer.activeTaskID = $settings.pomodoro.timer.tasks[0].id;
	};

	// ========

	// Used to prevent sound from playing when the page loads
	const loadedTimestamp = Date.now();

	const paused = $derived($settings.pomodoro.timer.times.length % 2 === 0);

	const currentTimerDuration = $derived(
		$settings.pomodoro.minutes[$settings.pomodoro.timer.activeTab] * 60 * 1000
	);

	const displaySettings = {
		digitsAfterSeconds: 0,
		alwaysShowHours: false,
		alwaysShowMinutes: true
	};

	// Time string displayed to user
	// If no times (user hasn't started) then display timer duration (ex. 25:00)
	// If there are times (user has hit start/pause) then show remaining time (ex. 24:59)
	// If remaining time is less than 0 (time has expired) then display 0 (ex. 00:00)
	const currentTime = $derived.by(() => {
		// Make svelte rerun this every clock tick
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		now.value;

		return $settings.pomodoro.timer.times.length === 0
			? msToStr(currentTimerDuration, displaySettings)
			: currentTimerDuration - getNetMs($settings.pomodoro.timer.times) > 0
				? msToStr(currentTimerDuration - getNetMs($settings.pomodoro.timer.times), displaySettings)
				: msToStr(0, displaySettings);
	});

	let timeUp = $state(false); // to make sure `onTimeUp` doesn't run multiple times at once

	$effect(() => {
		if (!timeUp && currentTimerDuration - getNetMs($settings.pomodoro.timer.times) <= 0) {
			timeUp = true;
			onTimeUp();
		}
	});

	const onTimeUp = () => {
		console.log('time up');

		// If the page loaded less than 1s ago, don't play sound
		if (Date.now() - loadedTimestamp > 1000) {
			playSound(
				$settings.pomodoro.sound.name,
				$settings.pomodoro.sound.repeat,
				$settings.pomodoro.sound.volume / 100
			);
		}

		onSkip();
		timeUp = false;
	};

	const onStart = () => {
		$settings.pomodoro.timer.times = [...$settings.pomodoro.timer.times, Date.now()];
		$settings.pomodoro.timer = $settings.pomodoro.timer;
	};
	const onPause = () => {
		$settings.pomodoro.timer.times = [...$settings.pomodoro.timer.times, Date.now()];
		$settings.pomodoro.timer = $settings.pomodoro.timer;
	};
	const onSkip = () => {
		// change tabs and pause
		if (!paused) {
			onPause();
		}
		nextActiveTab();
	};

	// change tabs based on current tab and time since long break
	const nextActiveTab = () => {
		const currentTab = $settings.pomodoro.timer.activeTab;
		if (currentTab === 'pomodoro') {
			if (
				$settings.pomodoro.timer.shortBreaksSinceLongBreak ===
				$settings.pomodoro.minutes.longBreakInterval
			) {
				$settings.pomodoro.timer.shortBreaksSinceLongBreak = 0;
				$settings.pomodoro.timer.activeTab = 'longBreak';
			} else {
				$settings.pomodoro.timer.shortBreaksSinceLongBreak++;
				$settings.pomodoro.timer.activeTab = 'shortBreak';
			}
			advanceTaskProgress();
		} else {
			$settings.pomodoro.timer.activeTab = 'pomodoro';
		}

		// recent current timer progress
		// and start timer if auto start is enabled
		if (
			(currentTab === 'pomodoro' && $settings.pomodoro.autoStartPomodoros) ||
			(currentTab !== 'pomodoro' && $settings.pomodoro.autoStartBreaks)
		) {
			$settings.pomodoro.timer.times = [Date.now()];
		} else {
			$settings.pomodoro.timer.times = [];
		}
		tomatoTimerSvg?.resetAnimation();
	};

	// furthers task progress
	// checks task and conditionally moves on to next task, checking off the completed task
	// updates activeTaskProgress, activeTask complete status, and activeTaskID
	const advanceTaskProgress = () => {
		// return if no tasks
		if ($settings.pomodoro.timer.tasks.length === 0) return;

		if (!activeTask) throw new Error('No active task');
		// current task already complete
		if (activeTask.complete === true) return;

		// increase progress
		$settings.pomodoro.timer.activeTaskProgress += 1;
		if ($settings.pomodoro.timer.activeTaskProgress >= activeTask.poms) {
			// complete current task
			activeTask.complete = true;

			// move to next task
			// if next task exists
			if ($settings.pomodoro.timer.tasks.length > activeIdx + 1) {
				$settings.pomodoro.timer.activeTaskProgress = 0;
				// activeIdx will be incremented when the activeTaskID is updated
				// set active task to next task
				$settings.pomodoro.timer.activeTaskID = $settings.pomodoro.timer.tasks[activeIdx + 1].id;
			}
		}
	};

	// NOTE: any because svelte type support for components sucks
	let tomatoTimerSvg: any = $state();

	// Note: if user clicks check to finish a task then clicks the next button,
	// the task state exhibits unexpected behavior

	// Note: if the user sets a timer and then navigates to another page (such as /worldclock)
	// then the timer expires, the sound is not played until the user navigates back to /pomorodo

	// Note: if the user sets a timer and then changes the minutes setting, it changes the current timer
	// If they do this such that the time would go below 0, it goes to 0 and onTimeUp runs
</script>

<Tabs tabs={tabData} activeTab={timerNames.indexOf($settings.pomodoro.timer.activeTab)} />

<div class="surface pad my-10 overflow-x-auto relative overflow-y-hidden text-center">
	<div class="absolute -z-10 left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 opacity-25 h-[90%]">
		<TomatoTimerSvg bind:this={tomatoTimerSvg} {paused} />
	</div>

	<h3 class="text-6xl sm:text-8xl mb-2">
		{currentTime}
	</h3>
	<Button
		icon={paused ? 'play' : 'pause'}
		variant="ghost"
		className="mr-4"
		onclick={() => (paused ? onStart() : onPause())}>
		{$dictionary.stopwatchSettings[paused ? 'Start' : 'Pause']}
	</Button>
	<Button
		variant="ghost"
		size="icon"
		icon="fastforward"
		title={$dictionary.labels['Next']}
		onclick={onSkip}>
	</Button>

	{#if ['combined'].includes($settings.pomodoro.displays.primary)}
		<div transition:fly|local={{ y: -160, duration: 250 }}>
			<hr class="mx-auto" />
			<h3 class="h4 mb-2">{$dictionary.pomodoroSettings['Current task']}</h3>
			{#if $settings.pomodoro.timer.tasks.length !== 0}
				<p class="p">
					#{activeIdx + 1}
					&mdash; {activeTask?.name}
					{@html activeTask?.name ? '&mdash;' : ''}
					{$settings.pomodoro.timer.activeTaskProgress}/{activeTask?.poms}
				</p>
			{/if}
		</div>
	{/if}
</div>

{#if ['split'].includes($settings.pomodoro.displays.primary)}
	<div transition:fly|local={{ y: -160, duration: 250 }} class="surface pad mb-10 overflow-x-auto">
		<h3 class="h4 mb-2">{$dictionary.pomodoroSettings['Current task']}</h3>
		{#if $settings.pomodoro.timer.tasks.length !== 0}
			<p class="p">
				#{activeIdx + 1}
				&mdash; {activeTask?.name}
				{@html activeTask?.name ? '&mdash;' : ''}
				{$settings.pomodoro.timer.activeTaskProgress}/{activeTask?.poms}
			</p>
		{/if}
	</div>
{/if}

{#if $settings.pomodoro.timer.tasks.length !== 0}
	{#if ['task_list', 'both'].includes($settings.pomodoro.displays.secondary)}
		<div
			transition:fly|local={{ y: -160, duration: 250 }}
			class="surface pad mb-10 overflow-x-auto">
			<h3 class="h4 mb-2">{$dictionary.pomodoroSettings['Tasks']}</h3>
			<table class="my-4 text-left">
				<thead>
					<tr class="p-sm">
						<th>{$dictionary.pomodoroSettings['Status']}</th>
						<th>{$dictionary.pomodoroSettings['Position']}</th>
						<th>{$dictionary.pomodoroSettings['Name']}</th>
						<th>{$dictionary.pomodoroSettings['Description']}</th>
						<th>{$dictionary.pomodoroSettings['Poms']}</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					{#each $settings.pomodoro.timer.tasks as task, idx (task.id)}
						<tr in:scale|local={{ duration: 250 }} out:fade|local={{ duration: 250 }}>
							<td>
								<Button
									size="icon"
									variant="ghost"
									icon={task.complete ? 'check' : 'minus'}
									title={$dictionary.pomodoroSettings['Status']}
									onclick={() =>
										($settings.pomodoro.timer.tasks[idx].complete =
											!$settings.pomodoro.timer.tasks[idx].complete)}>
								</Button>
							</td>
							<td class="p">{idx + 1}</td>
							<td>
								<input bind:value={task.name} type="text" class="w-full" maxlength="40" />
							</td>
							<td>
								<input
									bind:value={task.description}
									type="text"
									class="w-full"
									maxlength="200" /></td>
							<td class="p">{task.poms}</td>
							<td>
								<Button
									size="icon"
									variant="ghost"
									icon="trash"
									title={$dictionary.labels['Delete']}
									onclick={() => removeTask(task.id)}>
								</Button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>

			<div class="text-right">
				<Button
					variant="outline"
					icon="undo"
					animation="move-left"
					className="mr-4"
					onclick={startAtBeginning}>
					{$dictionary.pomodoroSettings['Start at beginning']}
				</Button>
				<Button
					variant="outline"
					icon="trash"
					animation="rotate-clock-sm"
					className="mr-4"
					onclick={deleteAll}>
					{$dictionary.labels['Delete all']}
				</Button>
				<Button variant="outline" icon="plus" animation="zoom" onclick={() => open('new-pomodoro')}>
					{$dictionary.labels['New']}
				</Button>
			</div>
		</div>
	{/if}

	{#if ['overview', 'both'].includes($settings.pomodoro.displays.secondary)}
		<div
			transition:fly|local={{ y: -160, duration: 250 }}
			class="surface pad mb-10 overflow-x-auto max-h-[48rem]">
			<PomodoroOverview />
		</div>
	{/if}
{:else}
	<NoTasks />
{/if}

<Button
	variant="outline"
	size="lg"
	icon="plus"
	animation="zoom"
	className="mr-4"
	onclick={() => open('new-pomodoro')}>
	{$dictionary.labels['New']}
</Button>

<Button
	variant="outline"
	size="lg"
	icon="info"
	animation="move-up"
	className="mr-4"
	onclick={() => open('about-pomodoro')}>
	{$dictionary.settingsTabs['About']}
</Button>

<Button
	variant="outline"
	size="lg"
	icon="settings"
	animation="rotate-clock"
	onclick={() => open('pomodoro-settings')}>
	{$dictionary.labels['Settings']}
</Button>
