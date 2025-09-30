<script lang="ts">
	/**
	 * Maybe / future:
	 * custom avg of X
	 * RubiksTabTimeList - reuse code in RubiksSingleSessionModal, take penalty into account
	 * import functionality for csv
	 * move types to one location (types/rubiks.ts)
	 * link to share scramble inside scramble view
	 * graphs (line graph on econdary bottom display, more graphs in a modal with analytics)
	 * explain keyboard shortcuts start on space up and end on space down - info modal / about page
	 * add btn to cube viewer to set to current scramble or enter string for scramble
	 * show best avg3 and best avg5 in session?
	 * option to show scramble as entire screen/fullscreen
	 * graphs? percentages in each time bucket (distribution), also cumulative graph, also line graph like stocks
	 * list of times show horitonztal bar relative to min/max
	 * info btn for avg of 3 and avg of 5
	 * info button explaining what a scramble is and why you use one
	 * link to and clean up chahm's site with "true" scrambles and webgl cube
	 * universal scramble every 1min - utc a single scramble every x time- modulo 60 seconds since epoch - everyone even offline gets the same scramble
	 * memoize avg of X times onMount in time list (performance) and highlight `td` not `td` with best avg of X and best time
	 * running chart on secondary display
	 * more charts in session view
	 * scramble modal walkthrough todos
	 */

	import { page } from '$app/state';
	import { onMount } from 'svelte';

	import RubiksCubeTimer from '$lib/components/pages/rubiks/RubiksCubeTimer.svelte';
	import { open } from '$lib/util/modal.svelte';
	import { decodeScramble } from '$lib/util/rubiksScrambleTranscoder';

	onMount(() => {
		if (page.url.searchParams.has('scramble')) {
			const scrambleParam = page.url.searchParams.get('scramble') as string;
			const scramble = decodeScramble(scrambleParam);
			// todo: check if `scramble` is valid and parse scramble
			open('rubiks-scramble-walkthrough', { scramble: scramble });
			// todo: show toast that says scramble loaded successfully or unsuccessfully
		}
	});
</script>

<div class="page-container">
	<RubiksCubeTimer />
</div>
