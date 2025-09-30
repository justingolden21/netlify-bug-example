<script module lang="ts">
	/**
	 * Parent component for both `/timer` and `/countdown`
	 */

	export interface Timer {
		type: 'timer';
		id: string;
		name: string;

		duration: number; // seconds
		running: boolean;
		start: number; // timestamp of start
		pausedSince: number; // 0 if running, else timestamp of pause
		played: boolean; // true if the sound has already played, to prevent playing again on page load
	}

	export interface Countdown {
		type: 'countdown';
		id: string;
		name: string;

		date: string; // value of input[type=date] in format 'YYYY-MM-DD'
		time: string; // value of input[type=time] in format 'HH:MM'
		timezone?: string; // timezone if user selected one, else undefined (uses user's current timezone)
		played: boolean;
	}
</script>

<script lang="ts">
	import { fade, scale } from 'svelte/transition';
	import { flip } from 'svelte/animate';

	import VectorArt from '$lib/components/features/misc/VectorArt.svelte';
	import NewTimer from '$lib/components/pages/timer/NewTimer.svelte';
	import TimerComponent from '$lib/components/pages/timer/Timer.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Tabs, { type Tab } from '$lib/components/ui/Tabs.svelte';
	import { dictionary } from '$lib/stores/languageDictionary';
	import { settings } from '$lib/stores/settings';

	const tabOptions = ['timer', 'countdown'] as const;
	interface Props {
		currentTab?: (typeof tabOptions)[number];
	}

	const { currentTab = 'timer' }: Props = $props();

	const tabData = $derived(
		tabOptions.map((option) => {
			return {
				name: $dictionary.timerSettings.tabNames[option],
				href: `/${option}`
			};
		}) as Tab[]
	);

	function removeItem(item: Timer | Countdown) {
		if (item.type === 'timer') {
			$settings.timer.timers = $settings.timer.timers.filter((t) => t.id !== item.id);
		} else {
			$settings.countdown.countdowns = $settings.countdown.countdowns.filter(
				(t) => t.id !== item.id
			);
		}
	}

	function deleteAllItems() {
		if (currentTab === 'timer') {
			$settings.timer.timers = [];
		} else {
			$settings.countdown.countdowns = [];
		}
	}
</script>

<Tabs tabs={tabData} activeTab={tabOptions.indexOf(currentTab)} links spaceBelow />

<NewTimer {currentTab} />

{#if (currentTab === 'timer' && $settings.timer.timers.length === 0) || (currentTab === 'countdown' && $settings.countdown.countdowns.length === 0)}
	<div class="select-none w-80 xl:w-96 mx-auto mb-10">
		<VectorArt name="timer" />
	</div>
{:else}
	<div class="flex flex-wrap gap-4 lg:gap-6 justify-center md:justify-start mb-10">
		{#if currentTab === 'timer'}
			{#each $settings.timer.timers as timer, idx (timer.id)}
				{@const isFlipcard = $settings.timer.displays.primary === 'flipcard'}
				<div
					class={!isFlipcard ? 'grow first:w-full' : 'w-full'}
					animate:flip={{ duration: 250 }}
					in:scale|local={{ duration: 250 }}
					out:fade|local={{ duration: 125 }}>
					<TimerComponent
						bind:timer={$settings.timer.timers[idx]}
						{removeItem}
						only={$settings.timer.timers.length === 1} />
				</div>
			{/each}
		{:else}
			{#each $settings.countdown.countdowns as countdown, idx (countdown.id)}
				{@const isFlipcard = $settings.countdown.displays.primary === 'flipcard'}
				<div
					class={!isFlipcard ? 'grow first:w-full' : 'w-full'}
					animate:flip={{ duration: 250 }}
					in:scale|local={{ duration: 250 }}
					out:fade|local={{ duration: 125 }}>
					<TimerComponent
						bind:timer={$settings.countdown.countdowns[idx]}
						{removeItem}
						only={$settings.countdown.countdowns.length === 1} />
				</div>
			{/each}
		{/if}
	</div>

	{#if (currentTab === 'timer' && $settings.timer.timers.length > 4) || (currentTab === 'countdown' && $settings.countdown.countdowns.length > 4)}
		<Button icon="trash" animation="rotate-clock-sm" variant="outline" onclick={deleteAllItems}>
			{$dictionary.labels['Delete all']}
		</Button>
	{/if}
{/if}

<!-- In case we want to move (or the option to move) new timer/countdown settings to separate modal -->
<!-- <Button icon="plus" variant="outline" size="icon" iconSize="lg" className="w-12 h-12 fixed bottom-6 right-6" aria-label={$dictionary.labels['New']}>
</Button> -->
