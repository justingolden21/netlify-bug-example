<script lang="ts">
	// svg analog clock reused in worldclock and clock, styled by analog clock themes
	import { onMount } from 'svelte';
	import { bounceOut, elasticOut, linear } from 'svelte/easing';

	import dayjs from 'dayjs';
	import tz from 'dayjs/plugin/timezone.js';
	import utc from 'dayjs/plugin/utc.js';
	dayjs.extend(utc);
	dayjs.extend(tz);

	import { numeralStyles } from '$lib/data/consts';
	import { settings } from '$lib/stores/settings';
	import type { Theme } from '$lib/stores/themes';
	import { emptyTheme } from '$lib/themes';
	import { getColor } from '$lib/util/color';
	import mergeDeep from '$lib/util/mergeSettings';
	import { now } from '$lib/util/now.svelte';

	const handEls = $state({} as Record<'hour' | 'minute' | 'second', SVGElement>);

	/**
	 * Minimal animation controls used to synchronize clock hand animations.
	 * `finished` resolves when the animation completes and `cancel` stops it.
	 */
	interface AnimationControls {
		cancel: () => void;
		finished: Promise<void>;
	}

	interface Props {
		mode?: 'static' | '';
		// `time` used for static displays. default 10h, 9m, 0s for aesthetics
		time?: {
			h: number;
			m: number;
			s: number;
		};
		timezone?: string | undefined;
		theme: DeepPartial<Theme>;
	}

	const { mode = '', time = { h: 10, m: 9, s: 0 }, timezone = undefined, theme }: Props = $props();
	const sizes = ['sm', 'md', 'lg'] as const;
	const hands = ['hour', 'minute', 'second'] as const;

	const currentTheme = $derived(
		mergeDeep(JSON.parse(JSON.stringify(emptyTheme)), theme) as unknown as Theme
	);

	const movements = { sweeping: linear, grandfather: bounceOut, modern: elasticOut } as const;
	const easing = $derived(movements[currentTheme.hands.secondHandMovement]);

	/**
	 * Animates a hand from one angle to another using `requestAnimationFrame`
	 * @param el target SVG element
	 * @param from starting angle in degrees
	 * @param to ending angle in degrees
	 * @param duration duration of animation in seconds
	 * @param easingFn easing function controlling the motion
	 */
	function animateRotation(
		el: SVGElement,
		from: number,
		to: number,
		duration: number,
		easingFn: (t: number) => number
	): AnimationControls {
		let start: number;
		let raf: number;
		let resolveFinished: () => void;
		const finished = new Promise<void>((res) => (resolveFinished = res));
		const step = (ts: number) => {
			if (start === undefined) start = ts;
			const progress = Math.min(1, (ts - start) / (duration * 1000));
			const eased = easingFn(progress);
			const angle = from + (to - from) * eased;
			el.style.transform = `rotateZ(${angle}deg)`;
			if (progress < 1) {
				raf = requestAnimationFrame(step);
			} else {
				resolveFinished();
			}
		};
		raf = requestAnimationFrame(step);
		return {
			cancel: () => {
				cancelAnimationFrame(raf);
				resolveFinished();
			},
			finished
		};
	}

	/**
	 * Calculate angles for each hand based on current or static time.
	 * @returns set of angles for hour, minute, and second hands
	 */
	function getAngles() {
		const date =
			mode === 'static'
				? dayjs().hour(time.h).minute(time.m).second(time.s)
				: dayjs(now.value)
						.tz(timezone || $settings.locale.timezone || 'Etc/GMT')
						.add(1, 'second');
		const hours = date.hour() % 12;
		const minutes = date.minute();
		const seconds = date.second();
		return {
			hour: (hours + minutes / 60 + seconds / 3600) * 30,
			minute: (minutes + seconds / 60) * 6,
			second: seconds * 6
		} as const;
	}

	const angles = getAngles();

	// Degrees each hand moves per second
	// Used to animate hands
	const angleDiff = {
		hour: 30 / 3600,
		minute: 6 / 60,
		second: 6
	};

	onMount(() => {
		let running = true;
		function tick(firstTick: boolean = true, animations: AnimationControls[] = []) {
			if (!running) return () => animations.forEach((animation) => animation.cancel());
			const angles = getAngles();
			animations = hands.map((hand) =>
				animateRotation(
					handEls[hand],
					firstTick ? angles[hand] : angles[hand] - angleDiff[hand],
					angles[hand],
					firstTick ? 0.1 : 1,
					hand === 'second' ? easing : linear
				)
			);
			setTimeout(async () => {
				if (running) {
					await Promise.all(animations.map((animation) => animation.finished));
					tick(false, animations);
				} else {
					animations.map((animation) => animation.cancel());
				}
			});
			return () => animations.forEach((animation) => animation.cancel());
		}
		const cancel = mode === 'static' ? null : tick();
		return () => {
			if (cancel) cancel();
			running = false;
		};
	});
</script>

<!--
@component
A customizable analog clock

 @param {string} mode: 'static' if the clock displays only one time
 @param {object} theme: custom theme object for clock or worldclock, usually from $settings. Can be missing keys
 @param {object} time: time to display if static
 @param {string} timezone: defaults to user's current setting. for use in worldclock

- Usage:
	```jsx
	<AnalogClock theme={theme} mode="static" time={{ h: 10, m: 9, s: 0 }} />
	```
-->

<svg class="clock w-full h-auto transition" viewBox="0 0 64 64">
	<!-- Shadow -->
	<rect
		x="4"
		y="2"
		width="60"
		height="60"
		fill={getColor(currentTheme.shadow?.fill, $settings)}
		rx={currentTheme.face?.shape == 'square'
			? 0
			: currentTheme.face?.shape == 'rounded'
				? 15
				: 30} />

	<!-- Face -->
	<rect
		x="2"
		y="2"
		width="60"
		height="60"
		fill={getColor(currentTheme.face?.fill, $settings)}
		stroke={getColor(currentTheme.face?.stroke, $settings)}
		stroke-width={currentTheme.face?.strokeWidth ?? '0'}
		rx={currentTheme.face?.shape == 'square'
			? 0
			: currentTheme.face?.shape == 'rounded'
				? 15
				: 30} />

	<!-- Ticks -->
	<g transform="translate(32,32)">
		{#each sizes as size}
			{@const r = 27.5 - currentTheme.ticks?.[size]?.width / 2}
			{#if currentTheme.ticks?.[size]}
				<circle
					fill="none"
					{r}
					stroke-dasharray={currentTheme.ticks[size].height +
						',' +
						((2 * r * Math.PI) / (size == 'sm' ? 60 : size == 'md' ? 12 : 4) -
							currentTheme.ticks[size].height)}
					stroke={getColor(currentTheme?.ticks?.[size]?.stroke, $settings)}
					stroke-width={currentTheme.ticks[size].width}
					transform={`rotate(-${currentTheme.ticks[size].height})`} />
			{/if}
		{/each}
	</g>

	<!-- Numerals -->
	{#if currentTheme.numerals}
		<g
			fill={getColor(currentTheme.numerals?.fill, $settings)}
			style="text-anchor: middle; pointer-events: none; user-select: none;">
			{#each numeralStyles[currentTheme.numerals.style] as numeral, idx}
				<!-- y is middle of character -->
				<text
					style="font: 600 6px '{currentTheme.numerals
						.fontFamily}', sans-serif; transform-origin: center"
					transform="rotate({(idx + 1) * 30})"
					x="32"
					y="8">
					{numeral}
				</text>
			{/each}
		</g>
	{/if}

	<!-- Hands -->
	<g transform="translate(32,32) rotate(180)">
		{#each hands as hand}
			{#if currentTheme.hands?.[hand]}
				<line
					style="transform: rotateZ({angles[hand]}deg)"
					bind:this={handEls[hand]}
					y1={-currentTheme.hands[hand].back}
					y2={currentTheme.hands[hand].length}
					stroke={getColor(currentTheme.hands[hand].stroke, $settings)}
					stroke-width={currentTheme.hands[hand].strokeWidth}
					stroke-linecap={currentTheme.hands[hand].linecap} />
			{/if}
		{/each}
	</g>

	<!-- Pin -->
	{#if currentTheme.pin}
		<circle
			cx="32"
			cy="32"
			fill={getColor(currentTheme.pin?.fill, $settings)}
			stroke={getColor(currentTheme.pin?.stroke, $settings)}
			stroke-width={currentTheme.pin?.strokeWidth ?? '0'}
			r={currentTheme.pin?.size ?? '0'} />
	{/if}
</svg>
