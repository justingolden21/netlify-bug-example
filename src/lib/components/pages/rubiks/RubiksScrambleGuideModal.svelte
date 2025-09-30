<script lang="ts">
	/**
	 * Modal explaining the basics of a rubiks cube's orientation and standard notation
	 */

	import RubiksCube3DModel, {
		type Direction
	} from '$lib/components/pages/rubiks/RubiksCube3DModel.svelte';
	import { dictionary } from '$lib/stores/languageDictionary';

	interface Face {
		name: 'Right' | 'Left' | 'Up' | 'Down' | 'Front' | 'Back';
		code: Direction;
	}

	const faces = [
		{ name: 'Right', code: 'R' },
		{ name: 'Left', code: 'L' },
		{ name: 'Up', code: 'U' },
		{ name: 'Down', code: 'D' },
		{ name: 'Front', code: 'F' },
		{ name: 'Back', code: 'B' }
	] as Face[];
</script>

<div class="pad">
	{#each $dictionary.rubiksSettings.scrambleGuide as p}
		<p class="p mt-2 first:mt-0">
			{p}
		</p>
	{/each}

	<div class="grid sm:grid-cols-2 md:grid-cols-3 gap-10 justify-center items-center my-10">
		{#each faces as face}
			<div class="max-w-xs mx-auto">
				<h3 class="h3 mb-2">{face.name}</h3>
				<RubiksCube3DModel move={face.code} velocity={Math.PI / 180} />
			</div>
		{/each}
	</div>
</div>
