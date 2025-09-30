<script lang="ts">
	// used by edit theme modal to select colors for analog clock theme
	import Button from '$lib/components/ui/Button.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { lightnesses } from '$lib/data/consts';
	import { dictionary } from '$lib/stores/languageDictionary';
	import { settings } from '$lib/stores/settings';
	import type { Color } from '$lib/stores/themes';
	import { getColor } from '$lib/util/color';

	interface Props {
		colorObj: Color;
		label: string;
	}

	let { colorObj = $bindable(), label }: Props = $props();

	let isOpen = $state(false);

	const palettes = ['base', 'accent'] as const;
</script>

<Button onclick={() => (isOpen = !isOpen)}>
	{#if colorObj.lightness === '-1'}
		<Icon name="eye_off" className="mr-2" />
	{:else}
		<span
			style:background-color={getColor(colorObj, $settings)}
			class="w-6 h-6 mr-2 inline border-2 border-base-300"></span>
	{/if}
	{$dictionary.display[label]}
</Button>
{#if isOpen}
	<div class="mt-2">
		{#each palettes as palette}
			{#each lightnesses as lightness}
				<button
					aria-label={$dictionary.display['Color:']}
					style:background-color={getColor({ palette: palette, lightness: lightness }, $settings)}
					class:rounded-full={!(colorObj.lightness === lightness && colorObj.palette === palette)}
					class="w-6 h-6 mr-2 inline border-2 border-base-300"
					onclick={() => {
						colorObj.lightness = lightness;
						colorObj.palette = palette;
						// Necessary because the component that uses this is a modal and modal data is a writable
						colorObj = colorObj;
					}}></button>
			{/each}
			<br />
		{/each}
		<Button
			variant="ghost"
			size="icon"
			icon="eye_off"
			onclick={() => (colorObj.lightness = '-1')}
			title={$dictionary.display['Transparent']}>
		</Button>
	</div>
{/if}
