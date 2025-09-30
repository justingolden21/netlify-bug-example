<script lang="ts">
	/**
	 * Modal to walk the user through scrambling a cube for the given scramble string
	 */

	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { onDestroy, onMount } from 'svelte';

	import RubiksCube3DModel, {
		type Move
	} from '$lib/components/pages/rubiks/RubiksCube3DModel.svelte';
	import { generateScramble } from '$lib/util/rubiksScrambleMap.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import RangeInput from '$lib/components/ui/RangeInput.svelte';
	import { addToast } from '$lib/components/ui/Toast.svelte';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import { dictionary } from '$lib/stores/languageDictionary';
	import { settings } from '$lib/stores/settings';
	import { copyText, copyURL } from '$lib/util/copy';
	import { encodeScramble } from '$lib/util/rubiksScrambleTranscoder';

	/**
	 * Future TODO
	 * click selected move button again to replay the animation
	 * going back one step is awkwardly animated
	 * - maybe if new state is different from previous (not going forward one move)
	 * - then we pause for 1s between changing to that state and animating
	 * - autoplay speed is counterintuitive (higher val goes slower)
	 */

	function copyScramble() {
		copyText(data.scramble).then((success) => {
			const text = success
				? $dictionary.messages['Copied successfully']
				: $dictionary.messages['Failed to copy'];
			const icon = success ? 'success' : 'error';
			addToast({ text, icon });
		});
	}

	async function copyScrambleLink() {
		const urlParams = new URLSearchParams(window.location.search);

		urlParams.set('scramble', encodeScramble(data.scramble));
		const url = `${window.location.pathname}?${urlParams.toString()}`;
		await goto(url);
		copyURL($dictionary);
	}

	function setAsCurrentScramble() {
		$settings.rubiks.scramble = data.scramble;
		generateScramble(false);
	}

	interface Props {
		data: { scramble: string };
	}

	let { data = $bindable() }: Props = $props();

	const scrambleMoves = $derived(data.scramble.split(' ') as Move[]);

	let rubiks3DModelComponent = $state() as RubiksCube3DModel;

	// Autoplay logic

	let currentScrambleMoveIdx = $state(-1);

	onMount(() => {
		const scrambleWalkthroughTimeout = setTimeout(
			performAutoplay,
			$settings.rubiks.scrambleWalkthrough.autoplaySpeed
		);

		return () => {
			clearTimeout(scrambleWalkthroughTimeout);
		};
	});

	onDestroy(() => {
		// Remove scramble URL param when closing modal
		page.url.searchParams.delete('scramble');
		goto(page.url.toString());
	});

	let globalAutoplayTimeout: NodeJS.Timeout | undefined = $state();
	function performAutoplay() {
		if (
			$settings.rubiks.scrambleWalkthrough.autoplay &&
			currentScrambleMoveIdx < scrambleMoves.length - 1
		) {
			currentScrambleMoveIdx++;
			performScramble();
		}

		// Using timeout instead of interval so if autoplay settings change then
		// the change is reflected in real time
		globalAutoplayTimeout = setTimeout(
			performAutoplay,
			$settings.rubiks.scrambleWalkthrough.autoplaySpeed
		);
	}

	function performScramble() {
		// Set initial state to all instructions except last
		// then animate last instruction
		rubiks3DModelComponent.set_scramble_move_index(currentScrambleMoveIdx + 1);
	}
</script>

<div class="pad max-w-5xl mx-auto">
	<div class="max-w-lg mx-auto">
		<RubiksCube3DModel bind:this={rubiks3DModelComponent} scramble={scrambleMoves} />
	</div>

	<div class="mt-4 w-full flex flex-wrap justify-center">
		<Button
			icon="chevron_left"
			variant="outline"
			className="border border-base-300 w-10 lg:w-16"
			disabled={currentScrambleMoveIdx <= 0}
			onclick={() => {
				$settings.rubiks.scrambleWalkthrough.autoplay = false;
				if (currentScrambleMoveIdx > 0) {
					currentScrambleMoveIdx--;
					performScramble();
				}
			}}>
		</Button>
		{#each scrambleMoves as scrambleMove, idx}
			<Button
				variant="outline"
				className="border border-base-300 w-10 lg:w-16 {currentScrambleMoveIdx === idx
					? 'bg-accent-700'
					: ''}"
				onclick={() => {
					$settings.rubiks.scrambleWalkthrough.autoplay = false;
					currentScrambleMoveIdx = idx;
					performScramble();
				}}>
				{scrambleMove}
			</Button>
		{/each}
		<Button
			icon="chevron_right"
			variant="outline"
			className="border border-base-300 w-10 lg:w-16"
			disabled={currentScrambleMoveIdx === scrambleMoves.length - 1}
			onclick={() => {
				$settings.rubiks.scrambleWalkthrough.autoplay = false;
				if (currentScrambleMoveIdx < scrambleMoves.length - 1) {
					currentScrambleMoveIdx++;
					performScramble();
				}
			}}>
		</Button>
	</div>

	<div class="flex flex-wrap gap-4 lg:gap-6 mt-4 justify-center">
		<Button icon="copy" animation="flip-horizontal" onclick={copyScramble}>
			{$dictionary.labels['Copy']}
		</Button>

		<Button icon="copy" animation="flip-horizontal" onclick={copyScrambleLink}>
			{$dictionary.labels['Copy link']}
		</Button>

		<Button icon="chevron_right" animation="move-right" onclick={setAsCurrentScramble}>
			{$dictionary.rubiksSettings['Set as current scramble']}
		</Button>
	</div>

	<hr class="my-10 mx-auto" />

	<div class="grid sm:grid-cols-2 gap-4 lg:gap-6">
		<Toggle
			id="auto-advance-toggle"
			bind:checked={$settings.rubiks.scrambleWalkthrough.autoplay}
			labelText={$dictionary.rubiksSettings['Autoplay scramble']} />
		<div class="flex">
			<label for="auto-advance-range" class="label">
				{$dictionary.rubiksSettings['Autoplay speed']}
			</label>
			<RangeInput
				id="auto-advance-range"
				bind:value={$settings.rubiks.scrambleWalkthrough.autoplaySpeed}
				onchange={() => {
					// If user changes timeout, we don't want user to have to wait for next iteration until it takes effect
					clearTimeout(globalAutoplayTimeout);
					globalAutoplayTimeout = setTimeout(
						performAutoplay,
						$settings.rubiks.scrambleWalkthrough.autoplaySpeed
					);
				}}
				min={500}
				step={500}
				max={5_000} />
		</div>
	</div>
</div>
