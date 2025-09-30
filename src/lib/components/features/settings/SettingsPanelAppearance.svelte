<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';

	import { PATTERNS } from '$lib/components/features/misc/BackgroundPattern.svelte';
	import SettingSelect from '$lib/components/features/settings/SettingSelect.svelte';
	import PaletteButtons from '$lib/components/features/settings/PaletteButtons.svelte';
	import Accordion from '$lib/components/ui/Accordion.svelte';
	import AccordionPanel from '$lib/components/ui/AccordionPanel.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import { fontFamilies } from '$lib/data/consts';
	import { dictionary } from '$lib/stores/languageDictionary';
	import type { Settings } from '$lib/stores/settings';
	import { defaultSettings, settings } from '$lib/stores/settings';
	import { isCastSupported } from '$lib/util/cast';
	import { displayPages } from '$lib/util/toggleDisplay';
	import validateInt from '$lib/util/validateInt';

	const castSupported = browser && isCastSupported(window);

	const validFontFamilies = $derived(
		Object.keys(fontFamilies).filter(
			(font) => $settings.locale.language !== 'hi' || font === 'Yatra One' || font === ''
		)
	);

	const appearanceOptions = [
		'baseColorPalette',
		'accentColorPalette',
		'darkMode',
		'showDarkButton',
		'showPrimaryButton',
		'showSecondaryButton',
		'showAboutButton',
		'showCastButton',
		'showFullscreenButton',
		'smallerMenu',
		'alwaysCollapseMenu',
		'hideTitlebarWhenIdle',
		'secondsUntilIdle',
		'fontFamily',
		'fontFamilyBody',
		'pitchBlackMode',
		'dayNightMode',
		'pattern',
		'invertMode'
	] satisfies (keyof Settings)[];

	function fontFamilyChange(evt: Event & { currentTarget: HTMLSelectElement }) {
		const family = evt.currentTarget.value;
		if (!(family in fontFamilies)) throw new Error(`Unknown font family: ${family}`);
		const weight = $settings.clock.datetimeFontWeight;
		const weights = fontFamilies[family as keyof typeof fontFamilies];
		// if selected font does not have selected weight
		if ((weights as readonly number[]).indexOf(+weight) == -1) {
			// default to first listed weight
			$settings.clock.datetimeFontWeight =
				fontFamilies[family as keyof typeof fontFamilies][0].toString();
		}
	}

	function resetAppearanceSettings() {
		for (const option of appearanceOptions) {
			// @ts-ignore: it works as all keys are present in settings and defaultSettings and they are both of type Settings
			$settings[option] = JSON.parse(JSON.stringify(defaultSettings[option]));
		}

		// auto detect user device preferences (same code as in layout)
		$settings.darkMode = !!window.matchMedia('(prefers-color-scheme: dark)').matches;
	}

	// Disgusting code here and in `background-color-select` because we have multiple variables instead of one
	// This is because we want to support old code from day/night
	const backgroundColorSelectVal = $derived(
		!$settings.darkMode
			? 'light'
			: $settings.dayNightMode
				? 'day_night'
				: $settings.pitchBlackMode
					? 'pitch_black'
					: 'dark'
	);
</script>

<Accordion key="1">
	<AccordionPanel accordionTitle={$dictionary.labels['Aesthetics']} key="1">
		<div class="mb-4">
			<h3 class="h4 mb-2">{$dictionary.labels.palettes.base}</h3>
			<PaletteButtons
				colors={['slate', 'gray', 'zinc', 'neutral', 'stone']}
				theme="baseColorPalette" />
			<h3 class="h4 mt-6 mb-2">{$dictionary.labels.palettes.accent}</h3>
			<PaletteButtons
				colors={[
					'rose',
					'pink',
					'fuchsia',
					'purple',
					'violet',
					'indigo',
					'blue',
					'sky',
					'cyan',
					'teal',
					'emerald',
					'green',
					'lime',
					'yellow',
					'amber',
					'orange',
					'red'
				]}
				theme="accentColorPalette" />
		</div>

		<SettingSelect
			id="background-color-select"
			selectLabel={$dictionary.labels['Background color:']}
			value={backgroundColorSelectVal}
			onchange={(evt) => {
				const val = evt.currentTarget.value;
				if (val === 'light') {
					$settings.darkMode = false;
					$settings.pitchBlackMode = false;
					$settings.dayNightMode = false;
				} else if (val === 'dark') {
					$settings.darkMode = true;
					$settings.pitchBlackMode = false;
					$settings.dayNightMode = false;
				} else if (val === 'pitch_black') {
					$settings.darkMode = true;
					$settings.pitchBlackMode = true;
					$settings.dayNightMode = false;
				} else {
					$settings.darkMode = true;
					$settings.pitchBlackMode = false;
					$settings.dayNightMode = true;
				}
			}}
			values={['light', 'dark', 'pitch_black', 'day_night']}
			labelMapper={(val) => $dictionary.labels.displayModes[val]} />

		{#if !$settings.pitchBlackMode}
			<div class="mt-4">
				<Toggle
					id="invert-filter-toggle"
					bind:checked={$settings.invertMode}
					labelText={$dictionary.labels['Invert filter']} />
			</div>
		{/if}

		<div class="mt-4 flex flex-wrap items-center gap-4 lg:gap-6">
			<SettingSelect
				id="pattern-select"
				selectLabel={$dictionary.labels['Pattern:']}
				bind:value={$settings.pattern.name}
				values={[
					'none',
					...Object.keys(PATTERNS)
						.filter((p) => p !== 'none')
						.sort()
				]}
				labelMapper={(val) => $dictionary.labels.Patterns[val]} />
			{#if $settings.pattern.name !== 'none'}
				<SettingSelect
					id="pattern-opacity-select"
					selectLabel={$dictionary.labels['Opacity:']}
					bind:value={$settings.pattern.opacity}
					values={[0.05, 0.1, 0.15, 0.2]}
					labelMapper={(_, idx) => (idx + 1).toString()} />

				<SettingSelect
					id="pattern-zoom-select"
					selectLabel={$dictionary.labels['Zoom:']}
					bind:value={$settings.pattern.zoom}
					values={[1, 1.5, 2, 2.5]}
					labelMapper={(_, idx) => (idx + 1).toString()} />
			{/if}
		</div>

		<div class="mt-4">
			<SettingSelect
				id="font-family-select"
				selectLabel={$dictionary.labels['Heading font family:']}
				bind:value={$settings.fontFamily}
				onchange={fontFamilyChange}
				values={validFontFamilies}
				labelMapper={(fontFamily) =>
					fontFamily === '' ? $dictionary.display['System default'] : fontFamily}
				dynamicFont={true} />
		</div>

		<div class="mt-4">
			<SettingSelect
				id="font-family-body-select"
				selectLabel={$dictionary.labels['Body font family:']}
				bind:value={$settings.fontFamilyBody}
				values={validFontFamilies}
				labelMapper={(fontFamily) =>
					fontFamily === '' ? $dictionary.display['System default'] : fontFamily}
				dynamicFont={true} />
		</div>
	</AccordionPanel>
	<AccordionPanel accordionTitle={$dictionary.labels['User Interface']} key="2">
		<Toggle
			id="show-dark-btn-toggle"
			bind:checked={$settings.showDarkButton}
			labelText={$dictionary.labels['Show dark button']} />

		<!-- only show setting to toggle display on pages with toggleable displays -->
		{#if displayPages.includes(page.url.pathname)}
			<Toggle
				id="show-primary-btn-toggle"
				bind:checked={$settings.showPrimaryButton}
				labelText={$dictionary.labels['Show primary toggle button']} />

			<Toggle
				id="show-secondary-btn-toggle"
				bind:checked={$settings.showSecondaryButton}
				labelText={$dictionary.labels['Show secondary toggle button']} />
		{/if}

		<Toggle
			id="show-about-btn-toggle"
			bind:checked={$settings.showAboutButton}
			labelText={$dictionary.labels['Show about button']} />

		<div class:hidden={!castSupported}>
			<Toggle
				id="show-cast-btn-toggle"
				bind:checked={$settings.showCastButton}
				labelText={$dictionary.labels['Show cast button']} />
		</div>

		<Toggle
			id="show-fullscreen-btn-toggle"
			bind:checked={$settings.showFullscreenButton}
			labelText={$dictionary.labels['Show fullscreen button']} />

		<hr class="my-4" />

		<Toggle
			id="smaller-menu-toggle"
			bind:checked={$settings.smallerMenu}
			labelText={$dictionary.labels['Smaller menu']} />

		<!-- only relevant on larger screens that don't always have the menu collapsed anyway -->
		<div class="hidden md:block">
			<Toggle
				id="always-collapse-menu-toggle"
				bind:checked={$settings.alwaysCollapseMenu}
				labelText={$dictionary.labels['Always collapse menu']} />
		</div>

		<Toggle
			id="hide-titlebar-when-idle-toggle"
			bind:checked={$settings.hideTitlebarWhenIdle}
			labelText={$dictionary.labels['Hide title bar when idle']} />

		{#if $settings.hideTitlebarWhenIdle}
			<div class="mt-2 ml-6">
				<label for="seconds-until-idle-input" class="label mr-2">
					{$dictionary.labels['Seconds until idle:']}
				</label>
				<input
					id="seconds-until-idle-input"
					oninput={(event) => {
						event.preventDefault();
						const value = validateInt(event.currentTarget);
						$settings.secondsUntilIdle = value;
						event.currentTarget.value = String(value);
					}}
					value={$settings.secondsUntilIdle}
					type="number"
					min="1"
					max="1000"
					required />
			</div>
			<br />
		{/if}
	</AccordionPanel>
</Accordion>
<div class="pad">
	<Button icon="undo" animation="move-left" onclick={resetAppearanceSettings}>
		{$dictionary.labels['Reset appearance settings']}
	</Button>
</div>
