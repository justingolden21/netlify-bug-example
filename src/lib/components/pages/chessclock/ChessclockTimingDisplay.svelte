<script lang="ts">
	/**
	 * Displays a string representing the given `timeControl`
	 */

	import { dictionary } from '$lib/stores/languageDictionary';

	// Copied from `settings.ts` - TODO dedupe
	interface TimeControl {
		startingTime: {
			min: number;
			sec: number;
		};
		increment: {
			method: 'none' | 'fischer' | 'bronstein' | 'simple_delay';
			sec: number;
		};
	}

	interface Props {
		timeControl: TimeControl;
	}

	const { timeControl }: Props = $props();
</script>

{timeControl.startingTime.min} : {timeControl.startingTime.sec.toString().padStart(2, '0')}

{#if timeControl.increment.method !== 'none'}
	| {timeControl.increment.sec}
	{$dictionary.chessclockSettings.timingMethods[timeControl.increment.method]}
{/if}
