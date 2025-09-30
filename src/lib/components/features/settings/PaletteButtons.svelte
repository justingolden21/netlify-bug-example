<script lang="ts">
	// color palette buttons for apparance theme settings - base and accent colors
	import TailwindColors from 'tailwindcss/colors.js';
	import type { DefaultColors } from 'tailwindcss/types/generated/colors';
	import { dictionary } from '$lib/stores/languageDictionary';

	import { settings } from '$lib/stores/settings';

	interface Props {
		colors: (keyof DefaultColors)[];
		theme: 'baseColorPalette' | 'accentColorPalette';
	}

	const { colors, theme }: Props = $props();
</script>

{#each colors as color}
	<button
		aria-label={$dictionary.display['Color:']}
		class="w-6 h-6 mr-2 border-2"
		class:rounded-full={$settings[theme] !== color}
		style:background-color={TailwindColors[color][400]}
		style:border-color={$settings[theme] === color ? 'white' : TailwindColors[color][300]}
		onclick={() => ($settings[theme] = color)}></button>
{/each}
