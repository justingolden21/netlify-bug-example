<script lang="ts">
	/**
	 * Modal for displaying a single rubiks cube session
	 */

	import LineChart from '$/lib/components/features/misc/LineChart.svelte';
	import VectorArt from '$lib/components/features/misc/VectorArt.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { dictionary } from '$lib/stores/languageDictionary';
	import { settings } from '$lib/stores/settings';
	import downloadCSV from '$lib/util/downloadCSV';
	import getFormat from '$lib/util/getFormat';
	import { close, open } from '$lib/util/modal.svelte';
	import { getAvg, getHi, getLo } from '$lib/util/rubiksStats';
	import { getDateTime } from '$lib/util/timeText';
	import uid from '$lib/util/uid';

	// get date session started
	const getFormattedDate = (date: Date) => {
		return getDateTime(date, getFormat('clock', 'date'));
	};

	interface Props {
		data: { sessionID: string };
	}

	let { data = $bindable() }: Props = $props();

	const theSession = $derived($settings.rubiks.sessions[data.sessionID]);

	function deleteSession() {
		delete $settings.rubiks.sessions[data.sessionID];
		// Handle if deleted session is the current one
		if ($settings.rubiks.currentSessionID === data.sessionID) {
			if (Object.keys($settings.rubiks.sessions).length === 0) {
				// If no other sessions exist, create one
				const rubiksSessionID = uid();
				$settings.rubiks.sessions = {
					[rubiksSessionID]: {
						name: '',
						timestamp: Date.now(),
						times: []
					}
				};
				$settings.rubiks.currentSessionID = rubiksSessionID;
			} else {
				// Else set the current session to the first one
				$settings.rubiks.currentSessionID = Object.keys($settings.rubiks.sessions)[0];
			}
		}
		close(); // Close the modal
	}

	function downloadSessionCSV() {
		const session = $settings.rubiks.sessions[data.sessionID];
		const csvData = [
			[
				$dictionary.rubiksSettings['Session Name'],
				$dictionary.rubiksSettings['Session Timestamp'],
				$dictionary.rubiksSettings['Session ID']
			],
			[session.name, session.timestamp, data.sessionID],
			[],
			[
				$dictionary.stopwatchSettings['Time'],
				$dictionary.rubiksSettings['Penalty'],
				$dictionary.rubiksSettings['Scramble'],
				$dictionary.rubiksSettings['Timestamp']
			]
		];
		session.times.map((time) => {
			csvData.push([time.time + time.penalty, time.penalty, time.scramble, time.timestamp]);
		});

		downloadCSV(csvData, `${session.name || 'Untitled'}.csv`);
	}

	function deleteTime(timestamp: number) {
		theSession.times = theSession.times.filter((t) => t.timestamp !== timestamp);

		// Update the time list behind the modal
		$settings.rubiks.sessions = $settings.rubiks.sessions;
	}
</script>

<!--
	Wrap modal in `if` check so deleting session doesn't crash.
	Modal will close after session is deleted anyway and we can't open a session that doesn't exist,
	so this `if` check resolves all problems.
-->
{#if theSession}
	<div class="pad">
		<div
			class="flex flex-wrap flex-col md:flex-row justify-between items-center gap-4 lg:gap-10 mb-4">
			<div class="text-center">
				<label for="session-name" class="label">
					{$dictionary.pomodoroSettings['Name:']}
				</label>
				<input id="session-name" type="text" maxlength="40" bind:value={theSession.name} />
			</div>

			<p class="p">{getFormattedDate(new Date(theSession.timestamp))}</p>

			<Button
				icon="play"
				variant="outline"
				className={data.sessionID === $settings.rubiks.currentSessionID
					? 'border-0 bg-accent-700 text-white hover:bg-accent-700'
					: ''}
				onclick={() => ($settings.rubiks.currentSessionID = data.sessionID)}>
				<p>
					{$dictionary.rubiksSettings[
						data.sessionID === $settings.rubiks.currentSessionID
							? 'Current session'
							: 'Make current'
					]}
				</p>
			</Button>

			{#if theSession.times.length > 0 && theSession.times.some((t) => !t.dnf)}
				<p class="h4">
					{$dictionary.rubiksSettings['Lo:']}
					<span class="font-bold">
						{getLo(theSession.times) / 1000}{$dictionary.rubiksSettings['seconds_short']}
					</span>
					<span class="mx-1">|</span>
					{$dictionary.rubiksSettings['Avg:']}
					<span class="font-bold">
						{getAvg(theSession.times) / 1000}{$dictionary.rubiksSettings['seconds_short']}
					</span>
					<span class="mx-1">|</span>
					{$dictionary.rubiksSettings['Hi:']}
					<span class="font-bold">
						{getHi(theSession.times) / 1000}{$dictionary.rubiksSettings['seconds_short']}
					</span>
				</p>

				<Button
					icon="download"
					animation="move-down"
					variant="outline"
					onclick={downloadSessionCSV}>
					{$dictionary.labels['Download']}
				</Button>
			{/if}

			<Button icon="trash" animation="rotate-clock-sm" variant="outline" onclick={deleteSession}>
				{$dictionary.labels['Delete']}
			</Button>
		</div>

		<!-- Reverse direction of times since most recent times are at the top and we want recent to be at the end of the chart -->
		<LineChart
			data={[theSession.times.map((t) => t.time + t.penalty).reverse()]}
			width={undefined}
			height={100} />

		<hr class="my-10 max-w-full" />

		{#if theSession.times.length > 0}
			<div class="w-full overflow-x-auto">
				<table class="p pb-4 whitespace-nowrap max-w-5xl mx-auto">
					<thead>
						<tr>
							<th>{$dictionary.stopwatchSettings['Time']}</th>
							<th>{$dictionary.rubiksSettings['Penalty']}</th>
							<th>{$dictionary.rubiksSettings['Scramble']}</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{#each theSession.times as time (time.timestamp)}
							<tr>
								<td>
									<span>
										<!-- fix for shift if time becomes over 10s due to penalty -->
										<span class="opacity-0">
											{time.time + time.penalty < 10_000 ? '0' : ''}
										</span>
										{#if time.dnf}
											<span class="font-bold">
												{$dictionary.rubiksSettings['DNF']}
											</span>
										{:else}
											{(time.time + time.penalty) / 1000}{$dictionary.rubiksSettings[
												'seconds_short'
											]}
										{/if}
									</span></td>
								<td class="flex items-center gap-4">
									<Button
										disabled={time.dnf || time.penalty === 0}
										onclick={() => {
											time.penalty -= 2000;
											// trigger reactivity in average of 3 and 5
											$settings.rubiks.sessions = $settings.rubiks.sessions;
										}}>
										{$dictionary.rubiksSettings['-2s']}
									</Button>
									<span class="block text-center">
										<!-- fix for shift if over 10s penalty -->
										<span class="opacity-0">
											{time.penalty < 10_000 ? '0' : ''}
										</span>
										{time.penalty / 1000}s
									</span>
									<Button
										disabled={time.dnf || time.penalty === 100_000}
										onclick={() => {
											time.penalty += 2000;
											// trigger reactivity in average of 3 and 5
											$settings.rubiks.sessions = $settings.rubiks.sessions;
										}}>
										{$dictionary.rubiksSettings['+2s']}
									</Button>
									<Button
										onclick={() => (time.dnf = !time.dnf)}
										title={$dictionary.rubiksSettings['Toggle DNF']}>
										{$dictionary.rubiksSettings[time.dnf ? 'Undo DNF' : 'Mark DNF']}
									</Button>
								</td>
								<td>
									<button
										class="a p-sm"
										onclick={() =>
											open('rubiks-scramble-walkthrough', { scramble: time.scramble })}>
										{time.scramble}
									</button>
								</td>
								<td>
									<Button
										icon="trash"
										variant="ghost"
										size="icon"
										onclick={() => deleteTime(time.timestamp)}
										title={$dictionary.labels['Delete']}>
									</Button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else}
			<div class="select-none w-64 xl:w-80 mx-auto">
				<VectorArt name="rubiks" />
			</div>
			<h3 class="p-lg sm:mt-6 text-center">{$dictionary.rubiksSettings['No times yet']}</h3>
		{/if}
	</div>
{/if}

<style lang="postcss">
	table td {
		@apply border-l border-base-300 first:border-0;
	}
	:global(.dark) table td {
		@apply border-base-600;
	}
</style>
