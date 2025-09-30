<script lang="ts">
	/**
	 * List of times in current session used by `RubiksCubeTimer`
	 *
	 * Displays table of times or vector art if empty
	 * and renders buttons at the bottom for clearing times and viewing sessions
	 */

	import { fly } from 'svelte/transition';

	import VectorArt from '$lib/components/features/misc/VectorArt.svelte';
	import type { RubiksTime } from '$lib/components/pages/rubiks/RubiksCubeTimer.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { dictionary } from '$lib/stores/languageDictionary';
	import { settings } from '$lib/stores/settings';
	import { open } from '$lib/util/modal.svelte';
	import { msToStr } from '$lib/util/stopwatch';

	// Mean of 3 solves — returns null if any are DNF
	function avgOfThree(idx: number, times: RubiksTime[]): number | null {
		if (idx + 2 >= times.length) return null;

		const slice = times.slice(idx, idx + 3);
		if (slice.some((t) => t.dnf)) return null;

		const sum = slice.reduce((total, t) => total + t.time + t.penalty, 0);
		return Math.floor(sum / 3);
	}

	// Mean of 5 solves, drop best and worst (after removing DNF)
	// Returns null if fewer than 3 valid times
	function avgOfFive(idx: number, times: RubiksTime[]): number | null {
		if (idx + 4 >= times.length) return null;

		const slice = times.slice(idx, idx + 5);
		const validTimes = slice.filter((t) => !t.dnf).map((t) => t.time + t.penalty);

		if (validTimes.length < 3) return null;

		// Use (a - b) to sort numbers correctly, since Array.prototype.sort() defaults to lexicographic (string-based) order
		// https://stackoverflow.com/questions/7000851/how-to-sort-numbers-correctly-with-array-sort
		validTimes.sort((a, b) => a - b);
		const middleThree = validTimes.slice(1, -1); // drop best & worst
		const sum = middleThree.reduce((a, b) => a + b, 0);
		return Math.floor(sum / middleThree.length);
	}

	function idxOfBest(items: RubiksTime[]) {
		let min = items[0].dnf ? Infinity : items[0].time;
		let bestIdx = items[0].dnf ? -1 : 0;
		items.forEach((item, idx) => {
			if (item.time < min && !item.dnf) {
				min = item.time;
				bestIdx = idx;
			}
		});
		return bestIdx;
	}

	const allTimes = $derived(
		$settings.rubiks.sessions[$settings.rubiks.currentSessionID]
			? $settings.rubiks.sessions[$settings.rubiks.currentSessionID].times
			: []
	);

	function clearTimes() {
		$settings.rubiks.sessions[$settings.rubiks.currentSessionID].times = [];
	}
</script>

<div class="h-full max-h-full overflow-auto">
	{#if allTimes.length > 0}
		<table
			in:fly|local={{ x: -80, duration: 250, delay: 250 }}
			out:fly|local={{ x: -80, duration: 250 }}
			class="p">
			<thead>
				<tr>
					<th>{$dictionary.stopwatchSettings['Time']}</th>
					<th>{$dictionary.rubiksSettings['avg_of_3']}</th>
					<th>{$dictionary.rubiksSettings['avg_of_5']}</th>
				</tr>
			</thead>
			<!--
				TODO: consider using below in `RubiksSingleSessionModal`
				This time list is rendered as a quick overview of the current session on the home screen
				While the session modal is meant for more in depth viewing/editing
				These two serve different purposes and may have different features
				That said, we basically have two of the same component so maybe we can dedupe further
			-->

			<!-- `t.timestamp` is the unique key, used here to animate in rows -->
			<tbody>
				{#each allTimes as t, idx (t.timestamp)}
					{@const isBest = idxOfBest(allTimes) === idx}
					{@const avgThree = avgOfThree(idx, allTimes)}
					{@const avgFive = avgOfFive(idx, allTimes)}
					<tr class:highlight={isBest} transition:fly|local={{ x: -80, duration: 250 }}>
						<td>
							{#if t.dnf}
								<span class="font-bold">
									{$dictionary.rubiksSettings['DNF']}
								</span>
							{:else}
								{msToStr(t.time + t.penalty, {
									alwaysShowHours: false,
									digitsAfterSeconds: 3
								})}
							{/if}
						</td>
						<td>
							{#if avgThree !== null}
								{msToStr(avgThree, {
									alwaysShowHours: false,
									digitsAfterSeconds: 3
								})}
							{:else}
								&mdash;
							{/if}
						</td>
						<td>
							{#if avgFive !== null}
								{msToStr(avgFive, {
									alwaysShowHours: false,
									digitsAfterSeconds: 3
								})}
							{:else}
								&mdash;
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{:else}
		<div
			in:fly|local={{ y: -80, duration: 250, delay: 250 }}
			out:fly|local={{ y: -80, duration: 250 }}
			class="select-none w-24 sm:w-32 md:w-48 xl:w-60 my-10 sm:my-4 lg:my-0 mx-auto">
			<VectorArt name="rubiks" />
			<h3 class="p-lg sm:mt-6 text-center">{$dictionary.rubiksSettings['No times yet']}</h3>
		</div>
	{/if}

	<div class="flex flex-wrap items-center justify-center gap-4 lg:gap-6 mt-4 lg:mt-6">
		{#if allTimes.length > 0}
			<Button onclick={clearTimes} icon="trash" animation="rotate-clock-sm">
				{$dictionary.labels['Delete all']}
			</Button>
		{/if}

		<Button onclick={() => open('rubiks-sessions')} icon="list" animation="move-up">
			{$dictionary.rubiksSettings['Sessions']}
		</Button>
		<Button
			icon="cube"
			animation="move-up"
			onclick={() =>
				open('rubiks-single-session', { sessionID: $settings.rubiks.currentSessionID })}>
			{$dictionary.rubiksSettings['Current session']}
		</Button>
	</div>
</div>

<style lang="postcss">
	tr.highlight {
		@apply bg-accent-300;
	}
	:global(.dark) tr.highlight {
		@apply bg-accent-900;
	}
	th,
	td {
		@apply text-right;
	}
</style>
