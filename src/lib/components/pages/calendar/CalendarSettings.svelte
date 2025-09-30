<script lang="ts">
	/**
	 * Settings component for `/calendar` settings
	 */

	import SettingSelect from '$lib/components/features/settings/SettingSelect.svelte';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import { dictionary } from '$lib/stores/languageDictionary';
	import { settings } from '$lib/stores/settings';
	import getTranslatedTimefield from '$lib/util/getTranslatedTimefield';

	const locale = $derived($settings.locale.language ?? 'en');
	const displayLabels = $derived({
		week: getTranslatedTimefield(locale, 'week', false, true),
		month: getTranslatedTimefield(locale, 'month', false, true),
		month_clock: $dictionary.clockSettings.clockFormats.month_clock,
		year: getTranslatedTimefield(locale, 'year', false, true),
		year_list: $dictionary.clockSettings.clockFormats.year_list
	});
</script>

<div class="pad">
	<h3 class="h4 mb-2">{$dictionary.clockSettings['Displays']}</h3>

	<div class="mb-4">
		<SettingSelect
			id="primary-display-select"
			selectLabel={$dictionary.clockSettings['Primary display:']}
			bind:value={$settings.calendar.displays.primary}
			values={['week', 'month', 'month_clock', 'year', 'year_list']}
			labels={displayLabels} />
	</div>

	<div class="mb-4">
		<SettingSelect
			id="secondary-display-select"
			selectLabel={$dictionary.clockSettings['Secondary display:']}
			bind:value={$settings.calendar.displays.secondary}
			values={['full', 'simple', 'none']}
			labels={$dictionary.clockSettings.clockFormats} />
	</div>

	{#if $settings.calendar.ampm !== null}
		<Toggle
			id="ampm-toggle"
			bind:checked={$settings.calendar.ampm}
			labelText={$dictionary.labels['Use AM / PM']} />
	{/if}

	<h3 class="h4 mt-6 mb-2">{$dictionary.calendarSettings['Events']}</h3>

	<div class="mb-4">
		<Toggle
			id="events-enabled-toggle"
			bind:checked={$settings.calendar.eventsEnabled}
			labelText={$dictionary.calendarSettings['Enable events']} />
	</div>

	{#if $settings.calendar.eventsEnabled}
		<div class="mb-4">
			<Toggle
				id="show-events-print-toggle"
				bind:checked={$settings.calendar.showEventsWhenPrinting}
				labelText={$dictionary.calendarSettings['Show events when printing']} />
		</div>

		<div class="mb-4">
			<Toggle
				id="confirm-delete-toggle"
				bind:checked={$settings.calendar.confirmBeforeDeleting}
				labelText={$dictionary.calendarSettings['Confirm before deleting']} />
		</div>
	{/if}
</div>
