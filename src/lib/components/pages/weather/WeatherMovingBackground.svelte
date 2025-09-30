<script module lang="ts">
	export type WeatherBackground = 'cloud' | 'rain' | 'snow' | 'sun';
</script>

<script lang="ts">
	/**
	 * Animated vector patterns for different weather types, used inside `/weather`
	 *
	 * Note: animation takes a while to start during HMR in dev - refresh to make it work
	 * Note: Makes 3x the number of items it seems, since all 3 types for each are rendered for smooth animation
	 */

	interface Props {
		backgroundType: WeatherBackground;
	}

	const { backgroundType = 'sun' }: Props = $props();

	function randomInt(min: number, max: number) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
	function randomType() {
		return randomInt(0, 2) as 0 | 1 | 2;
	}

	type Item = {
		x: number;
		y: number;
		type: 0 | 1 | 2;
	};

	let items: Item[] = [];
	let rains: Item[] = [];

	for (let i = 0; i < 30; i++) {
		items.push({
			x: randomInt(0, 100 - 18),
			y: randomInt(0, 100 - 18),
			type: randomType()
		});
	}

	for (let i = 0; i < 60; i++) {
		rains.push({
			x: randomInt(0, 100 - 5),
			y: randomInt(0, 100 - 10),
			type: randomType()
		});
	}

	// Cloud and snow
	const fills = ['fill-base-100', 'fill-base-300', 'fill-base-400'];
	const durs = [12, 16, 20];
	const scales = [1.25, 1, 0.75];

	// Rain
	const rainDurs = [6, 8, 10];
	// lightBlue 50,200,400
	const strokes = ['stroke-[#F0F9FF]', 'stroke-[#BAE6FD]', 'stroke-[#38BDF8]'];

	// sun uses same yellow as in `WeatherVectorBackground.svelte`
</script>

<div
	class="absolute top-0 left-0 w-full opacity-50 will-change-transform transition-none"
	aria-hidden="true">
	{#if backgroundType === 'cloud' || backgroundType === 'snow'}
		<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="max-h-[32rem] mx-auto">
			<defs>
				{#each scales as scale, idx}
					<path
						id="cloud{idx}"
						transform="scale({scale})"
						d="M13 14a4 4 0 100-10 4 4 0 10-9 2 4 4 0 00-4 4 4 4 0 004 4z" />
					<path
						id="snow{idx}"
						transform="scale({scale})"
						d="m7 16v-16m-7 4 14 8m0-8-14 8m5-11 2 2 2-2m3 2-.8 2.6 2.8.4m0 4-2.8.4.8 2.6m-3 2-2-2-2 2m-3-2 .8-2.6-2.8-.4m0-4 2.8-.4-.8-2.6" />
				{/each}
			</defs>

			{#each items as item, idx}
				{#if idx < 30}
					<!-- 3 sets of items so they both don't teleport and are evenly distributed -->
					{#each [0, 1, 2] as num}
						<use
							href="#{backgroundType === 'cloud' ? 'cloud' : 'snow'}{item.type}"
							x={item.x + -100 * num}
							y={item.y}
							class="cloud-item {backgroundType === 'cloud'
								? fills[item.type]
								: strokes[item.type]}"
							style="animation: move-x {durs[item.type]}s linear infinite;" />
					{/each}
				{/if}
			{/each}
		</svg>
	{:else if backgroundType === 'rain'}
		<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="max-h-[32rem] mx-auto">
			<defs>
				<path id="rain0" d="m5 0-5 10" />
				<path id="rain1" d="m5 0-3 6" />
				<path id="rain2" d="m5 0-2 4" />
			</defs>

			{#each rains as item, idx}
				{#if idx < 60}
					<!-- 3 sets of items so they both don't teleport and are evenly distributed -->
					{#each [0, 1, 2] as num}
						<use
							href="#rain{item.type}"
							x={item.x + 50 * num}
							y={item.y + -100 * num}
							class="rain-item {strokes[item.type]}"
							style="animation: move-diagonal {rainDurs[item.type]}s linear infinite;" />
					{/each}
				{/if}
			{/each}
		</svg>
	{:else if backgroundType === 'sun'}
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" class="max-h-[32rem] mx-auto">
			<g transform-origin="8 8">
				<circle fill="#EAB308" cx="8" cy="8" r="4" class="sun-core" />
				<path
					d="m8 16v-16m-7 4 14 8m0-8-14 8"
					fill="none"
					stroke="#EAB308"
					stroke-width="1"
					class="sun-ray" />
			</g>
		</svg>
	{/if}
</div>

<style lang="postcss">
	/* Sun */

	@keyframes sun-rotate {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	.sun-ray {
		animation: sun-rotate 12s linear infinite;
		transform-origin: 8px 8px;
	}

	@keyframes sun-pulse {
		0%,
		100% {
			transform: scale(0.8);
		}
		50% {
			transform: scale(1);
		}
	}

	.sun-core {
		animation: sun-pulse 6s ease-in-out infinite;
		transform-origin: 8px 8px;
	}

	/* Cloud, snowflake, rain */

	@keyframes -global-move-x {
		0% {
			transform: translateX(0);
		}
		100% {
			transform: translateX(200%);
		}
	}

	@keyframes -global-move-diagonal {
		0% {
			transform: translate(0, 0);
		}
		100% {
			transform: translate(-100%, 200%);
		}
	}

	/* All */

	.cloud-item,
	.sun-ray,
	.sun-core,
	.rain-item {
		will-change: transform;
	}

	@media (prefers-reduced-motion: reduce) {
		.cloud-item,
		.sun-ray,
		.sun-core,
		.rain-item {
			animation: none !important;
		}
	}
</style>
