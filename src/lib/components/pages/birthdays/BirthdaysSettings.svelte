<script lang="ts">
	/**
	 * Settings component for `/birthdays` settings
	 */

	import { goto } from '$app/navigation';

	import birthdaysImport from '$lib/util/birthdaysImport';
	import SettingSelect from '$lib/components/features/settings/SettingSelect.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import { dictionary } from '$lib/stores/languageDictionary';
	import { settings } from '$lib/stores/settings';
	import { encodeBirthdays } from '$lib/util/birthdaysTranscoder';
	import { copyURL } from '$lib/util/copy';
	import validateInt from '$lib/util/validateInt';
	import getTranslatedTimefield from '$lib/util/getTranslatedTimefield';

	let importText = $state('');
	const exportText = $derived(encodeBirthdays($settings.birthdays.birthdays));
	const locale = $derived($settings.locale.language ?? 'en');
</script>

<div class="pad">
	<h3 class="h4 mb-2">{$dictionary.clockSettings['Displays']}</h3>

	<div class="mb-4">
		<SettingSelect
			id="primary-display-select"
			selectLabel={$dictionary.clockSettings['Primary display:']}
			bind:value={$settings.birthdays.displays.primary}
			values={['full', 'simple']}
			labels={$dictionary.clockSettings.clockFormats} />
	</div>

	<div class="mb-4">
		<SettingSelect
			id="secondary-display-select"
			selectLabel={$dictionary.clockSettings['Secondary display:']}
			bind:value={$settings.birthdays.displays.secondary}
			values={['default', 'simple']}
			labels={$dictionary.clockSettings.clockFormats} />
	</div>

	<div class="mb-4">
		<Toggle
			id="searchbar-toggle"
			bind:checked={$settings.birthdays.displays.showSearchbar}
			labelText={$dictionary.birthdaysSettings['Show searchbar']} />
	</div>

	<div class="mb-4">
		<Toggle
			id="month-headings-toggle"
			bind:checked={$settings.birthdays.displays.showMonthHeadings}
			labelText={$dictionary.birthdaysSettings['Show month headings']} />
	</div>

	<div class="mb-4">
		<Toggle
			id="confetti-toggle"
			bind:checked={$settings.birthdays.displays.showConfetti}
			labelText={$dictionary.birthdaysSettings['Show confetti if birthday is today']} />
	</div>

	<div class="mb-4">
		<Toggle
			id="highlight-birthday-toggle"
			bind:checked={$settings.birthdays.displays.highlightCloseBirthdays}
			labelText={$dictionary.birthdaysSettings['Highlight close birthdays']} />
	</div>

	{#if $settings.birthdays.displays.highlightCloseBirthdays}
		<div class="mb-4">
			<input
				id="birthday-days-input"
				type="number"
				min="0"
				max="60"
				oninput={(event) => {
					event.preventDefault();
					const value = validateInt(event.currentTarget);
					$settings.birthdays.displays.highlightCloseBirthdaysDays = value;
					event.currentTarget.value = String(value);
				}}
				value={$settings.birthdays.displays.highlightCloseBirthdaysDays} />
			<label for="birthday-days-input" class="ml-2 label">
				{getTranslatedTimefield(locale, 'day', true)}
			</label>
		</div>
	{/if}

	<div class="mb-4">
		<SettingSelect
			id="start-at-current-month-select"
			showLabel={false}
			selectLabel={$dictionary.labels['Order:']}
			value={$settings.birthdays.displays.startAtCurrentMonth.toString()}
			values={['true', 'false']}
			onchange={(evt) =>
				($settings.birthdays.displays.startAtCurrentMonth = evt.currentTarget.value === 'true')}
			labels={$dictionary.birthdaysSettings.startAtCurrentMonth} />
	</div>

	<hr class="my-10" />

	<h3 class="h4 mb-2">
		{$dictionary.labels['Import / Export']}
	</h3>

	<div class="grid sm:grid-cols-2 gap-4 lg:gap-6">
		<div class="flex flex-col gap-2">
			<label for="import" class="label">
				{$dictionary.birthdaysSettings['importInstructions']}
			</label>
			<textarea
				id="import"
				rows="4"
				bind:value={importText}
				class="flex-grow border-2 border-base-300 dark:border-base-600"></textarea>

			<Button
				animation="move-right"
				className="self-end"
				onclick={() => birthdaysImport(importText)}
				icon="input">
				{$dictionary.labels['Import']}
			</Button>
		</div>

		<div class="flex flex-col gap-2">
			<label for="export" class="label">
				{$dictionary.birthdaysSettings['exportInstructions']}
			</label>
			<textarea
				id="export"
				rows="4"
				value={exportText}
				class="flex-grow border-2 border-base-300 dark:border-base-600"></textarea>

			<Button
				animation="rotate-clock"
				className="self-end"
				onclick={async () => {
					const birthdays = encodeBirthdays($settings.birthdays.birthdays);
					const urlParams = new URLSearchParams(window.location.search);

					urlParams.set('birthdays', birthdays);
					const url = `${window.location.pathname}?${urlParams.toString()}`;
					await goto(url);
					copyURL($dictionary);
				}}
				icon="link">
				{$dictionary.labels['Copy link']}
			</Button>
		</div>
	</div>

	<hr class="my-10" />

	{#if $settings.birthdays.birthdays.length > 0}
		<Button
			animation="rotate-clock-sm"
			onclick={() => ($settings.birthdays.birthdays = [])}
			icon="trash">
			{$dictionary.labels['Delete all']}
		</Button>
	{/if}
</div>
