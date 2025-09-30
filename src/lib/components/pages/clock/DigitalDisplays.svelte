<script lang="ts">
	import { fly } from 'svelte/transition';
	import TailwindColors from 'tailwindcss/colors.js';

	import BatteryIcon from '$lib/components/pages/clock/BatteryIcon.svelte';
	import { settings } from '$lib/stores/settings';
	import getFormat from '$lib/util/getFormat';
	import { now } from '$lib/util/now.svelte';
	import { getDateTime } from '$lib/util/timeText';

	const clockSettings = $derived($settings.clock);
	const displays = $derived(clockSettings.displays);

	function clockDateTime(now: Date, type: 'date' | 'time') {
		return getDateTime(now, getFormat('clock', type));
	}

	const time = $derived(clockDateTime(now.value, 'time'));
	const date = $derived(clockDateTime(now.value, 'date'));

	// @see displayOptions in util/toggleDisplay
	const displayMap = $derived({
		time,
		date,
		datetime: `${time}\n${date}`
	});

	const baseColorPalette = $derived(
		TailwindColors[$settings.baseColorPalette] as Record<ColorLightness, string>
	);
	const accentColorPalette = $derived(
		TailwindColors[$settings.accentColorPalette] as Record<ColorLightness, string>
	);
	const shade = $derived(($settings.darkMode ? '300' : '800') as ColorLightness);
</script>

<div class="flex flex-col justify-between h-full max-h-full">
	<!-- empty div for centering -->
	<div></div>
	{#if displays.primary === 'text'}
		<textarea
			bind:value={displays.text}
			in:fly|local={{ y: -160, duration: 125 }}
			id="primary-display"
			style:--primary-font-weight={$settings.clock.datetimeFontWeight}
			style:color={displays.primaryPalette === 'base'
				? baseColorPalette[shade]
				: accentColorPalette[shade]}
			class="{displays.primary +
				' text-' +
				displays.primaryFontSize} border-none w-full resize-none h-full"
			spellcheck="false"
			autocomplete="off"></textarea>
	{:else if displays.primary !== 'analog'}
		<h2
			in:fly|local={{ y: -160, duration: 125 }}
			id="primary-display"
			style:--primary-font-weight={$settings.clock.datetimeFontWeight}
			style:color={displays.primaryPalette === 'base'
				? baseColorPalette[shade]
				: accentColorPalette[shade]}
			class={displays.primary + ' text-' + displays.primaryFontSize}>
			{displayMap[displays.primary]}
		</h2>
	{/if}
	<div class="flex items-end justify-center {displays.battery ? 'sm:justify-between' : ''}">
		{#if displays.secondary !== 'none' && displays.battery}
			<!-- hidden battery display for alignment -->
			<h2
				transition:fly|local={{ y: -80, duration: 125 }}
				class={'opacity-0 -z-10 battery-display hidden sm:flex items-center gap-2 text-' +
					displays.secondaryFontSize}>
				<BatteryIcon />
			</h2>
		{/if}
		{#if displays.secondary === 'text'}
			<textarea
				bind:value={displays.text}
				in:fly|local={{ y: -80, duration: 125 }}
				id="secondary-display"
				style:color={displays.secondaryPalette === 'base'
					? baseColorPalette[shade]
					: accentColorPalette[shade]}
				class="{displays.secondary +
					' text-' +
					displays.secondaryFontSize} border-none w-full resize-none h-full font-light"
				spellcheck="false"
				autocomplete="off"></textarea>
		{:else if displays.secondary !== 'none'}
			<h2
				transition:fly|local={{ y: -80, duration: 125 }}
				id="secondary-display"
				style:color={displays.secondaryPalette === 'base'
					? baseColorPalette[shade]
					: accentColorPalette[shade]}
				class={displays.secondary + ' text-' + displays.secondaryFontSize}>
				{displayMap[displays.secondary]}
			</h2>
		{/if}
		{#if displays.battery}
			<h2
				transition:fly|local={{ y: -80, duration: 125 }}
				class={'battery-display hidden sm:flex items-center gap-2 text-' +
					displays.secondaryFontSize}
				style:color={displays.secondaryPalette === 'base'
					? baseColorPalette[shade]
					: accentColorPalette[shade]}>
				<BatteryIcon />
			</h2>
		{/if}
	</div>
</div>

<style lang="postcss">
	#primary-display,
	#secondary-display,
	.battery-display {
		@apply leading-none;
		white-space: break-spaces;
	}

	#primary-display {
		font-weight: var(--primary-font-weight);
		@apply px-2 text-center;
	}
	#secondary-display {
		text-align: center;
	}

	/* Font sizes */
	#secondary-display.datetime.text-small,
	.battery-display.text-small {
		font-size: clamp(1rem, 1.25vw, 5rem);
	}

	#secondary-display.text-small,
	#secondary-display.datetime,
	.battery-display {
		font-size: clamp(1rem, 2.5vw, 5rem);
	}
	#primary-display.datetime.text-small,
	#secondary-display,
	#secondary-display.datetime.text-large,
	.battery-display.text-large {
		font-size: clamp(1rem, 5vw, 5rem);
	}
	#primary-display.text-small,
	#primary-display.datetime,
	#secondary-display.text-large,
	#secondary-display.datetime.text-extralarge,
	.battery-display.text-extralarge {
		font-size: clamp(2rem, 10vw, 10rem);
	}
	#primary-display,
	#primary-display.datetime.text-large,
	#secondary-display.text-extralarge {
		font-size: clamp(3rem, 15vw, 15rem);
	}
	#primary-display.text-large,
	#primary-display.datetime.text-extralarge {
		font-size: clamp(5rem, 20vw, 25rem);
	}
	#primary-display.text-extralarge {
		font-size: clamp(6rem, 25vw, 30rem);
	}

	/* Adjust font sizes when navbar (18rem wide) is visible (screens larger than 768px) */
	@media (min-width: 768px) {
		#secondary-display.datetime.text-small,
		.battery-display.text-small {
			font-size: clamp(1rem, calc(2.5vw - 0.225rem), 5rem); /* Subtracting 1.25% of 18rem */
		}

		#secondary-display.text-small,
		#secondary-display.datetime,
		.battery-display {
			font-size: clamp(1rem, calc(2.5vw - 0.45rem), 5rem); /* Subtracting 2.5% of 18rem */
		}
		#primary-display.datetime.text-small,
		#secondary-display,
		#secondary-display.datetime.text-large,
		.battery-display.text-large {
			font-size: clamp(1rem, calc(5vw - 0.9rem), 5rem); /* Subtracting 5% of 18rem */
		}
		#primary-display.text-small,
		#primary-display.datetime,
		#secondary-display.text-large,
		#secondary-display.datetime.text-extralarge,
		.battery-display.text-extralarge {
			font-size: clamp(2rem, calc(10vw - 1.8rem), 10rem); /* Subtracting 10% of 18rem */
		}
		#primary-display,
		#primary-display.datetime.text-large,
		#secondary-display.text-extralarge {
			font-size: clamp(3rem, calc(15vw - 2.7rem), 15rem); /* Subtracting 15% of 18rem */
		}
		#primary-display.text-large,
		#primary-display.datetime.text-extralarge {
			font-size: clamp(5rem, calc(20vw - 3.6rem), 25rem); /* Subtracting 20% of 18rem */
		}
		#primary-display.text-extralarge {
			font-size: clamp(6rem, calc(25vw - 4.5rem), 30rem); /* Subtracting 25% of 18rem */
		}
	}
</style>
