<script lang="ts">
	interface Props {
		paused: boolean;
	}

	const { paused }: Props = $props();

	let bars = $state() as SVGPathElement,
		barsTimeout: ReturnType<typeof setTimeout> | undefined = $state();

	export function resetAnimation() {
		if (bars) {
			bars.classList.add('reset');
			barsTimeout = setTimeout(() => bars.classList.remove('reset'), 1500);
		}
	}

	$effect(() => {
		if (!paused) {
			if (bars) {
				bars.classList.remove('reset');
				clearTimeout(barsTimeout);
			}
		}
	});
</script>

<svg viewBox="0 0 14 14" class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
	<!-- tomato body -->
	<path class="fill-accent-700" d="m0 8s0 6 4 6h6s4 0 4-6zM0 7s0-5 4-5h6s4 0 4 5z" />
	<!-- white bars -->
	<g clip-path="url(#a)">
		<path
			id="bars"
			bind:this={bars}
			class:running={!paused}
			class:reset={false}
			fill="#fff"
			transform="translate(-20 0)"
			d="m1.75 8.5h.5v2.25h-.5zm2 0h.5v1.5h-.5zm2 0h.5v1.5h-.5zm2 0h.5v1.5h-.5zm2 0h.5v1.5h-.5zm2 0h.5v2.25h-.5zm2 0h.5v1.5h-.5zm2 0h.5v1.5h-.5zm2 0h.5v1.5h-.5zm2 0h.5v1.5h-.5zm2 0h.5v2.25h-.5z" />
	</g>

	<!-- tomato top -->
	<g class="fill-base-700">
		<path d="m7 4.5-1.5-2s-.5-1 1.5-1 1.5 1 1.5 1l-1.5 2z" />
		<path
			d="M2 2 l2-1s.5-.25 2 0v1zM7.5 0s.5 0 .5.5v1.5h-2v-1.5s0-.5.5-.5zM12 2l-2-1s-.5-.25-2 0v1z" />
	</g>
	<!-- arrow -->
	<path fill="#fff" d="m6.5 5.5h1l-.5 1z" />
	<defs>
		<clipPath id="a">
			<!-- clip to red bottom -->
			<path d="m0 8s0 6 4 6h6s4 0 4-6z" />
		</clipPath>
	</defs>
</svg>

<style>
	#bars {
		/* 5 bars every 15s, 3s per bar */
		animation: marquee 15s linear infinite;
		animation-fill-mode: forwards;
		animation-play-state: paused;
	}
	#bars.running {
		animation-play-state: running;
	}
	#bars.reset {
		animation-play-state: running;
		animation: resetMarquee 1.5s ease-in-out;
	}
	@keyframes marquee {
		0% {
			transform: translate(0, 0);
		}
		100% {
			/* bars loop every 10 units, svg width is 14 units, 10/14 = 71.4% */
			transform: translate(-71.4285714%, 0);
		}
	}

	@keyframes resetMarquee {
		0% {
			transform: translate(-71.4285714%, 0);
		}
		100% {
			transform: translate(0, 0);
		}
	}
</style>
