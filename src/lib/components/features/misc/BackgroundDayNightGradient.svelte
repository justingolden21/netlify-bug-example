<script lang="ts">
	/**
	 * Day/Night background gradient that changes based on time of day
	 *
	 * Does not account for sunrise/sunset position and is hard coded by hour
	 * `gradientColors` contains 2 arrays of 24 colors for top and bottom colors for each hour
	 * `hours` tracks the current hour and is used as an index of `gradientColors` and updated on an interval
	 */

	import { onMount } from 'svelte';
	import colors from 'tailwindcss/colors';
	import type { DefaultColors } from 'tailwindcss/types/generated/colors';

	import { settings } from '$lib/stores/settings';

	/**
	 * Testing notes:
	 *
	 * To step through gradients, uncomment div below
	 *
	 * To animate through at faster speed:
	 * Change interval to `hours = new Date().getSeconds()/60*24`
	 * Change dur to `dur="24s"`
	 */

	// Track `hours`

	let hours = $state(new Date().getHours());

	onMount(() => {
		const gradientInterval = setInterval(() => (hours = new Date().getHours()), 60 * 60 * 1000);
		return () => clearInterval(gradientInterval);
	});

	// https://stackoverflow.com/a/31317821/4907950
	function shiftArray(arr: Array<any>, idx: number) {
		return arr.concat(arr.splice(0, idx));
	}

	// 24 length arrays for 24 hours in a day
	const gradientColors = [
		[
			// Top colors
			colors.slate[900],
			colors.slate[900],
			colors.slate[900],
			colors.slate[900],
			colors.slate[800],
			colors.slate[700],
			colors.blue[800],
			colors.blue[700],
			colors.blue[400],
			colors.blue[300],
			colors.sky[200],
			colors.sky[300],
			colors.sky[400],
			colors.sky[500],
			colors.sky[600],
			colors.sky[700],
			colors.sky[800],
			colors.blue[900],
			colors.slate[700],
			colors.slate[800],
			colors.slate[900],
			colors.slate[900],
			colors.slate[900],
			colors.slate[900]
		],
		[
			// Bottom colors
			colors.slate[900],
			colors.slate[900],
			colors.slate[800],
			colors.slate[700],
			colors.slate[600],
			colors.pink[300],
			colors.pink[200],
			colors.pink[300],
			colors.red[300],
			colors.indigo[300],
			colors.sky[500],
			colors.sky[600],
			colors.sky[700],
			colors.sky[800],
			colors.sky[800],
			colors.indigo[500],
			colors.indigo[600],
			colors.amber[500],
			colors.amber[700],
			colors.orange[900],
			colors.slate[900],
			colors.slate[900],
			colors.slate[900],
			colors.slate[900]
		]
	];

	// Update gradients based on hours
	const topColors = $derived(shiftArray([...gradientColors[0]], hours));
	const bottomColors = $derived(shiftArray([...gradientColors[1]], hours));

	const baseColor = $derived($settings.baseColorPalette as keyof DefaultColors);
</script>

<!-- For testing purposes -->
<!-- <div class="z-50">
	<button onclick={() => (hours = (--hours + 24) % 24)}>prev</button>
	hours: {hours}
	<button onclick={() => (hours = new Date().getHours())}>now</button>
	<button onclick={() => (hours = ++hours % 24)}>next</button>
</div> -->

<!--
	SVG background that changes color based on hour in the day and animates between colors
	Gradient is 0.5 opacity and the background (`baseColor`) is based on a dark shade of the current base palette
-->
<svg xmlns="http://www.w3.org/2000/svg" class="inset-0 absolute w-screen h-screen">
	<linearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%">
		<stop stop-color="#000" offset="0%">
			<animate
				attributeName="stop-color"
				dur="86400s"
				values={topColors.join(';')}
				repeatCount="indefinite" />
		</stop>
		<stop stop-color="#000" offset="100%">
			<animate
				attributeName="stop-color"
				dur="86400s"
				values={bottomColors.join(';')}
				repeatCount="indefinite" />
		</stop>
	</linearGradient>
	{#if $settings.pattern.name === 'none'}
		<rect x="0" y="0" width="100%" height="100%" fill={colors[baseColor][900]} />
	{/if}
	<rect x="0" y="0" width="100%" height="100%" fill="url(#sky)" opacity="0.5" />
</svg>
