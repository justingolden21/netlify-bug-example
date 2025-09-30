<script module lang="ts">
	/**
	 * Rubiks cube timer parent that handles layout of `/rubikscube` page
	 *
	 * Conditionally displays `RubiksTabTimer`, `RubiksTabTimeList`, and `RubiksScrambleMap`
	 * based off of display settings.
	 */

	export interface RubiksTime {
		time: number;
		penalty: number;
		scramble: string;
		timestamp: number;
		dnf: boolean;
	}
	export interface RubiksSession {
		name: string;
		timestamp: number;
		times: RubiksTime[];
	}
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';

	import RubiksCubeBackground from '$lib/components/pages/rubiks/RubiksCubeBackground.svelte';
	import RubiksScrambleMap from '$lib/components/pages/rubiks/RubiksScrambleMap.svelte';
	import RubiksTabTimeList from '$lib/components/pages/rubiks/RubiksTabTimeList.svelte';
	import RubiksTabTimer from '$lib/components/pages/rubiks/RubiksTabTimer.svelte';
	import Tabs, { type Tab } from '$lib/components/ui/Tabs.svelte';
	import { dictionary } from '$lib/stores/languageDictionary';
	import { settings } from '$lib/stores/settings';

	const tabData = $derived([
		{
			name: $dictionary.clockSettings.clockFormats['timer'],
			content: RubiksTabTimer,
			icon: 'stopwatch'
		},
		{
			name: $dictionary.clockSettings.clockFormats['times'],
			content: RubiksTabTimeList,
			icon: 'table'
		}
	] as Tab[]);

	let rubiksPrimary = $state() as HTMLDivElement;

	onMount(() => {
		/**
		 * Handle getting and setting top section size
		 * Default is 24rem (384px) in `settings.ts`
		 * Min height is 16rem / 256px and max is 32px / 512px defined in `div#rubiks-primary` below
		 */
		document.addEventListener('mouseup', function () {
			$settings.rubiks.display.primaryHeight = rubiksPrimary?.clientHeight ?? 384;
		});

		rubiksPrimary.style.height = $settings.rubiks.display.primaryHeight + 'px';
	});
</script>

{#if $settings.rubiks.display.showBackground}
	<div class="w-full h-full absolute top-0 left-0 flex justify-center items-center">
		<RubiksCubeBackground />
	</div>
{/if}

<!-- `relative` necessary for z-index of `RubiksCubeBackground` above to not go on top -->
<div class="relative grid grid-rows-[auto_1fr] h-full max-h-full">
	<div
		bind:this={rubiksPrimary}
		class="overflow-x-hidden min-h-[16rem] max-h-[32rem] resize-y border-b border-base-300 dark:border-base-600">
		{#if $settings.rubiks.displays.primary === 'timer_and_times'}
			<div in:fly|local={{ y: -160, duration: 250 }} class="h-full w-full">
				<div class="lg:hidden pad h-full overflow-hidden">
					<Tabs tabs={tabData} hideOverflow />
				</div>

				<div class="hidden lg:grid pad h-full gap-4 lg:gap-10 grid-cols-2">
					<RubiksTabTimer />
					<RubiksTabTimeList />
				</div>
			</div>
		{:else}
			<div in:fly|local={{ y: -160, duration: 250 }} class="h-full w-full">
				<RubiksTabTimer />
			</div>
		{/if}
	</div>
	<div class="pad overflow-x-hidden h-full">
		{#if $settings.rubiks.displays.secondary === 'scramble'}
			<div in:fly|local={{ y: -160, duration: 250 }}>
				<RubiksScrambleMap />
			</div>
		{:else if $settings.rubiks.displays.secondary === 'times'}
			<div in:fly|local={{ y: -160, duration: 250 }}>
				<RubiksTabTimeList />
			</div>
		{/if}
	</div>
</div>
