<script lang="ts">
	// modal used to edit an analog clock theme
	import AnalogClock from '$lib/components/features/analog/AnalogClock.svelte';
	import ColorSelector from '$lib/components/features/analog/ColorSelector.svelte';
	import SettingSelect from '$lib/components/features/settings/SettingSelect.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { fontFamilies, movements, numeralStyles } from '$lib/data/consts';
	import { dictionary } from '$lib/stores/languageDictionary';
	import { settings } from '$lib/stores/settings';
	import { userThemes, type Theme } from '$lib/stores/themes';
	import { closeByName } from '$lib/util/modal.svelte';
	import getTranslatedTimefield from '$lib/util/getTranslatedTimefield';

	interface Props {
		data: { theme: Theme; page: 'clock' | 'worldclock' };
	}

	let { data = $bindable() }: Props = $props();

	const sizes = ['sm', 'md', 'lg'] as const;
	const hands = ['hour', 'minute', 'second'] as const;
	const locale = $derived($settings.locale.language ?? 'en');

	/**
	 * Check and hide ticks behind numerals
	 *
	 * When the user adds numerals to their clock, the ticks will be in the way
	 * This function conveniently hides all ticks that would be blocking numerals the user selected
	 */
	function updateTicksFromNumerals(evt: Event & { currentTarget: HTMLSelectElement }) {
		const hideTicks = (size: keyof Theme['ticks']) => {
			// if face is transparent, don't bother
			if (data.theme.face.fill.lightness === '-1') return;

			// set the ticks to be same color as face
			// (if we just make it width 0 or lightness -1, the smaller ticks show through)
			data.theme.ticks[size].stroke.lightness = data.theme.face.fill.lightness;
			data.theme.ticks[size].stroke.palette = data.theme.face.fill.palette;

			// prevent other ticks from showing through
			data.theme.ticks[size].width = Math.min(
				Math.max(data.theme.ticks['md'].width, data.theme.ticks['sm'].width) + 1,
				5
			);
			data.theme.ticks[size].height = Math.min(
				Math.max(data.theme.ticks['md'].height, data.theme.ticks['sm'].height) + 0.5,
				2.5
			);
		};

		const style = evt.currentTarget.value;
		const lgStyles = ['numerals', 'fourNumerals', 'numbers', 'fourNumbers'];
		const mdStyles = ['numerals', 'numbers'];

		if (mdStyles.includes(style)) hideTicks('md');
		if (lgStyles.includes(style)) hideTicks('lg');
	}

	let selectedCategory = $state('Face');

	function setTheme(theme: Theme) {
		switch (data.page) {
			case 'clock':
				$settings.clock.themeID = theme.id;
				break;
			case 'worldclock':
				$settings.worldclock.themeID = theme.id;
				break;
		}
		$settings = $settings;
	}

	const saveTheme = (data: { theme: Theme }) => {
		userThemes.update((value) => [
			data.theme,
			...value.filter((theme) => theme.id !== data.theme.id)
		]);
		setTheme(data.theme);
		closeByName('modal-new-theme');
		closeByName('modal-edit-theme');
	};
</script>

<div
	class="sm:grid grid-cols-[2fr_1fr] lg:grid-cols-[auto_1fr] grid-rows-[auto_1fr_auto] h-full sm:overflow-hidden">
	<div
		class="sticky top-0 w-full p-4 bg-base-50 dark:bg-base-700 lg:space-y-2 whitespace-nowrap overflow-auto row-start-1 row-end-2 col-start-1 col-end-3 lg:col-end-2 z-10">
		{#each ['Face', 'Pin', 'Numerals', 'Ticks', 'Hands'] as category}
			<Button
				className="lg:block lg:w-full mx-1 lg:mx-0 lg:px-4 p-2 min-w-[4rem] text-center lg:text-left hover:bg-base-200 hover:dark:bg-base-800 {selectedCategory ===
				category
					? 'bg-base-200 dark:bg-base-800'
					: ''}"
				variant="ghost"
				onclick={() => (selectedCategory = category)}>
				{$dictionary.clockSettings[category]}
			</Button>
		{/each}
	</div>
	<!--
		On small screens, calculate based on height
		On lg screens, calculate based on width
	-->
	<div
		class="w-full lg:h-full p-4 lg:dark:bg-base-700 lg:bg-base-50 row-start-2 row-end-3 col-start-2 col-end-3 lg:col-start-1 lg:col-end-2">
		<div class="rounded surface p-2 aspect-square w-32 sm:w-48 md:w-64">
			<AnalogClock theme={data.theme} mode="static" />
		</div>
	</div>
	<div
		class="flex flex-col justify-between row-start-2 lg:row-start-1 row-end-3 col-start-1 lg:col-start-2 col-end-2 overflow-y-auto">
		<div class="flex-1 grid grid-cols-3 pad gap-4 lg:block">
			<div class="col-span-2">
				<h3 class="h3 mb-2">{$dictionary.clockSettings[selectedCategory]}</h3>
				<hr class="mb-4" />
				{#if selectedCategory === 'Face'}
					<div class="mb-2">
						<ColorSelector bind:colorObj={data.theme.face.fill} label="Fill color" />
					</div>
					<div class="mb-2">
						<ColorSelector bind:colorObj={data.theme.shadow.fill} label="Shadow fill color" />
					</div>
					<div class="mb-2">
						<SettingSelect
							id="face-stroke-width-select"
							selectLabel={$dictionary.display['Stroke width:']}
							bind:value={data.theme.face.strokeWidth}
							values={[...Array(6).keys()]} />
					</div>
					{#if data.theme.face.strokeWidth !== 0}
						<div class="mb-2">
							<ColorSelector bind:colorObj={data.theme.face.stroke} label="Stroke color" />
						</div>
					{/if}
					<div class="mb-2">
						<SettingSelect
							id="face-shape-select"
							selectLabel={$dictionary.display['Shape:']}
							bind:value={data.theme.face.shape}
							values={['circle', 'rounded', 'square']}
							labels={$dictionary.display.shapes} />
					</div>
				{:else if selectedCategory === 'Pin'}
					<div class="mb-2">
						<SettingSelect
							id="pin-size-select"
							selectLabel={$dictionary.display['Size:']}
							bind:value={data.theme.pin.size}
							values={[...Array(6).keys()].map((x) => x / 2)} />
					</div>
					{#if data.theme.pin.size !== 0}
						<div class="mb-2">
							<ColorSelector bind:colorObj={data.theme.pin.fill} label="Fill color" />
						</div>
						<div class="mb-2">
							<SettingSelect
								id="pin-stroke-width-select"
								selectLabel={$dictionary.display['Stroke width:']}
								bind:value={data.theme.pin.strokeWidth}
								values={[...Array(7).keys()].map((x) => x / 2)} />
						</div>
						{#if data.theme.pin.strokeWidth !== 0}
							<div class="mb-2">
								<ColorSelector bind:colorObj={data.theme.pin.stroke} label="Stroke color" />
							</div>
						{/if}
					{/if}
				{:else if selectedCategory === 'Numerals'}
					<div class="mb-2">
						<SettingSelect
							id="numerals-select"
							selectLabel={$dictionary.clockSettings['Numeral Style:']}
							bind:value={data.theme.numerals.style}
							onchange={updateTicksFromNumerals}
							values={Object.keys(numeralStyles)}
							labels={$dictionary.labels['Numeral Styles']} />
					</div>
					{#if data.theme.numerals.style !== 'none'}
						<div class="mb-2">
							<ColorSelector bind:colorObj={data.theme.numerals.fill} label="Fill color" />
						</div>

						<!-- Since numerals are always the same Latin characters, user's language doesn't matter, unlike font selection elsewhere -->
						<SettingSelect
							id="numerals-font-family-select"
							selectLabel={$dictionary.labels['Font family:']}
							bind:value={data.theme.numerals.fontFamily}
							onchange={updateTicksFromNumerals}
							values={Object.keys(fontFamilies).filter((x) => x !== '')}
							dynamicFont={true} />
					{/if}
				{:else if selectedCategory === 'Ticks'}
					<div class="w-full grid xl:grid-cols-3 xl:gap-4">
						{#each sizes as size, idx}
							<div class="mb-2">
								<h3 class="h4 mb-2 {idx !== 0 ? 'mt-6' : ''}">
									{$dictionary.clockSettings.sizes[
										{ sm: 'small', md: 'medium', lg: 'large' }[size]
									]}
								</h3>
								<div class="mb-2">
									<ColorSelector
										bind:colorObj={data.theme.ticks[size].stroke}
										label="Stroke color" />
								</div>
								{#if data.theme.ticks[size].stroke.lightness !== '-1'}
									<div class="mb-2">
										<SettingSelect
											id="{size}-tick-width-select"
											selectLabel={$dictionary.display['Width:']}
											bind:value={data.theme.ticks[size].width}
											values={[...Array(6).keys()]} />
									</div>
									<div class="mb-2">
										<SettingSelect
											id="{size}-tick-height-select"
											selectLabel={$dictionary.display['Height:']}
											bind:value={data.theme.ticks[size].height}
											values={[...Array(7).keys()].map((x) => x / 2)} />
									</div>
								{/if}
							</div>
						{/each}
					</div>
				{:else if selectedCategory === 'Hands'}
					<SettingSelect
						id="second-hand-movement-select"
						selectLabel={$dictionary.clockSettings['Second hand movement:']}
						bind:value={data.theme.hands.secondHandMovement}
						values={movements}
						labels={$dictionary.labels['Movements']} />

					<div class="w-full grid xl:grid-cols-3 xl:gap-4">
						{#each hands as hand}
							<div>
								<h3 class="h4 mt-6 mb-2">
									{getTranslatedTimefield(locale, hand, false, true)}
								</h3>
								<div class="mb-2">
									<ColorSelector
										bind:colorObj={data.theme.hands[hand].stroke}
										label="Stroke color" />
								</div>
								{#if data.theme.hands[hand].stroke.lightness !== '-1'}
									<div class="mb-2">
										<SettingSelect
											id="{hand}-hand-stroke-width-select"
											selectLabel={$dictionary.display['Stroke width:']}
											bind:value={data.theme.hands[hand].strokeWidth}
											values={[...Array(6).keys()].map((x) => (x + 1) / 2)} />
									</div>
									<div class="mb-2">
										<SettingSelect
											id="{hand}-hand-length-select"
											selectLabel={$dictionary.display['Length:']}
											bind:value={data.theme.hands[hand].length}
											values={[...Array(6).keys()].map((x) => x * 3 + 12)} />
									</div>
									<div class="mb-2">
										<SettingSelect
											id="{hand}-hand-back-select"
											selectLabel={$dictionary.display['Back:']}
											bind:value={data.theme.hands[hand].back}
											values={[...Array(10).keys()]} />
									</div>
									<div class="mb-2">
										<SettingSelect
											id="{hand}-hand-linecap-select"
											selectLabel={$dictionary.display['Linecap:']}
											bind:value={data.theme.hands[hand].linecap}
											values={['round', 'square']}
											labels={$dictionary.display.linecaps} />
									</div>
								{/if}
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
	<div
		class="border-t-2 border-base-300 p-4 dark:border-base-600 flex flex-col gap-4 sm:flex-row justify-between w-full row-start-3 row-end-4 col-span-full">
		<div class="flex grow items-center">
			<label for="theme-name" class="label">{$dictionary.labels['Name']}</label>
			<input id="theme-name" class="grow" type="text" bind:value={data.theme.name} maxlength="50" />
		</div>
		<Button icon="save" animation="move-down" onclick={() => saveTheme(data)}>
			{$dictionary.labels['Save theme']}
		</Button>
	</div>
</div>
