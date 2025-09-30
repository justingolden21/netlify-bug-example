<script lang="ts">
	/**
	 * Modal for displaying a list of rubiks cube sessions as cards
	 */

	import { onMount } from 'svelte';

	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime.js';
	dayjs.extend(relativeTime);

	import Button from '$lib/components/ui/Button.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { addToast } from '$lib/components/ui/Toast.svelte';
	import { dictionary } from '$lib/stores/languageDictionary';
	import { settings } from '$lib/stores/settings';
	import { open } from '$lib/util/modal.svelte';
	import { getAvg, getHi, getLo } from '$lib/util/rubiksStats';
	import uid from '$lib/util/uid';

	onMount(() => {
		// Hacky way of updating on an interval
		// See Stopwatch.svelte for more docs
		const itvl = setInterval(() => {
			$settings.rubiks.sessions = $settings.rubiks.sessions;
		}, 60 * 1000); // update every min for the `fromNow` display in cards

		return () => clearInterval(itvl);
	});

	// Handle `sessions`

	function deleteAllSessions() {
		// Leave user with one session
		const rubiksSessionID = uid();
		$settings.rubiks.sessions = {
			[rubiksSessionID]: {
				name: '',
				timestamp: Date.now(),
				times: []
			}
		};
		$settings.rubiks.currentSessionID = rubiksSessionID;
	}

	function newSession() {
		// max 100 sessions
		if (Object.keys($settings.rubiks.sessions).length >= 100) {
			const text = $dictionary.messages['Too many sessions'];
			const icon = 'error';
			addToast({ text, icon });
			return;
		}

		const rubiksSessionID = uid();
		$settings.rubiks.sessions[rubiksSessionID] = {
			name: '',
			timestamp: Date.now(),
			times: []
		};
		$settings.rubiks.currentSessionID = rubiksSessionID;
	}
</script>

<div class="pad">
	<div class="grid md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-10">
		{#each Object.keys($settings.rubiks.sessions) as id}
			{@const session = $settings.rubiks.sessions[id]}
			<button
				class="pad surface relative hover:bg-base-300 dark:hover:bg-base-600"
				onclick={() => open('rubiks-single-session', { sessionID: id })}>
				<Icon
					name="cube_rubiks"
					strokeWidth="thin"
					className="w-full h-full absolute inset-0 opacity-5 -z-10" />
				<p class="h3 overflow-hidden">{session.name || $dictionary.labels['Untitled']}</p>

				{#if id === $settings.rubiks.currentSessionID}
					<p class="p-1 mt-2 rounded bg-accent-700/75 text-white">
						{$dictionary.rubiksSettings['Current session']}
					</p>
				{/if}

				{#if $settings.locale.language === 'en'}
					<p class="p mt-2">
						{dayjs(new Date(session.timestamp))
							.locale($settings.locale.datetime ?? 'en')
							.fromNow()}
					</p>
				{/if}
				<p class="p mt-2">
					{#if session.times.length === 1}
						{$dictionary.rubiksSettings['1 time']}
					{:else}
						{$dictionary.rubiksSettings['123 times'].replace('123', session.times.length)}
					{/if}
				</p>
				{#if session.times.length > 0 && session.times.some((t) => !t.dnf)}
					<p class="p mt-2">
						{$dictionary.rubiksSettings['Lo:']}
						<span class="font-bold">
							{getLo(session.times) / 1000}{$dictionary.rubiksSettings['seconds_short']}
						</span>
						<span class="mx-1">|</span>
						{$dictionary.rubiksSettings['Avg:']}
						<span class="font-bold">
							{getAvg(session.times) / 1000}{$dictionary.rubiksSettings['seconds_short']}
						</span>
						<span class="mx-1">|</span>
						{$dictionary.rubiksSettings['Hi:']}
						<span class="font-bold">
							{getHi(session.times) / 1000}{$dictionary.rubiksSettings['seconds_short']}
						</span>
					</p>
				{/if}
			</button>
		{/each}
	</div>

	<div class="flex flex-wrap gap-4 lg:gap-6 mt-4 lg:mt-6">
		<Button
			size="lg"
			variant="outline"
			icon="trash"
			animation="rotate-clock-sm"
			onclick={deleteAllSessions}>
			{$dictionary.labels['Delete all']}
		</Button>
		<Button size="lg" variant="outline" icon="plus" animation="zoom" onclick={newSession}>
			{$dictionary.labels['New']}
		</Button>
	</div>
</div>
