<script lang="ts">
	interface Props {
		value: number;
		isFullscreen: boolean;
		simple?: boolean; // todo: use this option
	}

	const { value, isFullscreen, simple = false }: Props = $props();

	let previousValue = $state(value);
	let animate = $state(false);

	let upperFade = $state(value);
	let upperFlip = $state(value);
	let lowerFade = $state(value);
	let lowerFlip = $state(value);

	// Trigger animation when value changes
	// Update values displayed on cards at correct time (each half of animation takes 0.3s)
	$effect(() => {
		if (value !== previousValue) {
			animate = true;
			previousValue = value;

			upperFade = value;

			setTimeout(() => {
				lowerFlip = value;
			}, 300);

			setTimeout(() => {
				animate = false;

				upperFlip = value;
				lowerFade = value;
			}, 600);
		}
	});

	const display = (num: number) => num.toString().padStart(2, '0');
</script>

<div
	class="flip-card"
	class:animate
	class:fullscreen={isFullscreen}
	class:simple
	class:large={value > 99}>
	<div class="upper" class:animate>
		<span>
			{display(upperFade)}
		</span>
	</div>
	<div class="base upper" class:animate>
		<span>
			{display(upperFlip)}
		</span>
	</div>
	<div class="base lower" class:animate>
		<span>
			{display(lowerFlip)}
		</span>
	</div>
	<div class="lower" class:animate>
		<span>
			{display(lowerFade)}
		</span>
	</div>
</div>

<style lang="postcss">
	/* Animation */

	@keyframes flipUpper {
		0% {
			transform: rotateX(0);
		}
		100% {
			transform: rotateX(-90deg);
		}
	}
	@keyframes flipLower {
		0% {
			transform: rotateX(90deg);
		}
		100% {
			transform: rotateX(0);
		}
	}
	@keyframes fadeIn {
		0% {
			opacity: 0;
		}
		100% {
			opacity: 1;
		}
	}
	@keyframes fadeOut {
		0% {
			opacity: 1;
		}
		100% {
			opacity: 0;
		}
	}

	.upper:not(.base).animate {
		animation: fadeIn 0.3s ease-in forwards;
	}
	.upper.base.animate {
		animation: flipUpper 0.3s ease-in forwards;
	}
	.lower.base.animate {
		animation: flipLower 0.3s ease-out forwards;
		animation-delay: 0.3s;
	}
	.lower:not(base).animate {
		animation: fadeOut 0.3s ease-out forwards;
		animation-delay: 0.3s;
	}

	/* Flip card */
	/* `large` class for days input if 3 digits long, 50% wider */

	.flip-card {
		position: relative;
		border-radius: 0.5rem;
		text-align: center;

		width: 5rem;
		height: 6rem;
		font-size: 4rem;
		line-height: 6rem;
	}
	.flip-card.large {
		width: 10rem;
	}

	@media screen(sm) {
		.flip-card {
			width: 7.5rem;
			height: 9rem;
			font-size: 6rem;
			line-height: 9rem;
		}
		.flip-card.large {
			width: 11.25rem;
		}
	}
	@media screen(lg) {
		.flip-card {
			width: 10rem;
			height: 12rem;
			font-size: 8rem;
			line-height: 12rem;
		}
		.flip-card.large {
			width: 15rem;
		}
	}
	.flip-card.fullscreen {
		width: 20rem;
		height: 24rem;
		font-size: 16rem;
		line-height: 24rem;
	}
	.flip-card.fullscreen.large {
		width: 30rem;
	}

	/* Sections */

	.upper,
	.lower {
		overflow: hidden;
		position: absolute;
		width: 100%;
		height: 50%;
	}
	.upper {
		border-radius: 0.5rem 0.5rem 0 0;
		transform-origin: 50% 100%;
	}
	.lower {
		top: 50%;
		border-radius: 0 0 0.5rem 0.5rem;
		transform-origin: 50% 0%;
	}
	.lower span {
		position: relative;
		top: -100%;
	}

	/* Details */

	.flip-card:not(.simple) .upper,
	.flip-card:not(.simple) .lower {
		@apply bg-base-100 text-base-900;
	}
	.flip-card:not(.simple) .upper {
		border-bottom: solid 2px #0003;
	}
	.flip-card:not(.simple) .lower {
		border-top: solid 2px #fff3;
	}
</style>
