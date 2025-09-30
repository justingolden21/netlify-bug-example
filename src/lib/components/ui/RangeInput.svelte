<script lang="ts">
	interface Props {
		className?: string;
		id?: string;
		value: number;
		onchange?: (event: Event) => void;
		min?: number;
		max?: number;
		step?: number;
	}

	let {
		className = '',
		id = '',
		value = $bindable(0),
		onchange = () => {},
		min = 0,
		max = 100,
		step = 1
	}: Props = $props();
</script>

<input type="range" bind:value class={className} {id} {min} {max} {step} {onchange} />

<style lang="postcss">
	input[type='range'] {
		@apply h-2 w-full max-w-xl appearance-none rounded-full bg-base-300 accent-accent-700;
	}
	:global(.dark) input[type='range'] {
		@apply bg-base-600;
	}

	input[type='range']::-webkit-slider-thumb {
		@apply h-6 w-6 cursor-pointer appearance-none rounded-full border-0 bg-accent-700;
	}

	input[type='range']::-moz-range-thumb {
		@apply h-6 w-6 cursor-pointer appearance-none rounded-full border-0 bg-accent-700;
	}

	input[type='range']::-ms-thumb {
		@apply h-6 w-6 cursor-pointer appearance-none rounded-full border-0 bg-accent-700;
	}
</style>
