<script lang="ts">
	/**
	 * Settings component for `/timestamp` settings
	 */

	import SettingSelect from '$lib/components/features/settings/SettingSelect.svelte';
	import { dictionary } from '$lib/stores/languageDictionary';
	import { settings } from '$lib/stores/settings';
</script>

<div class="pad">
	<h3 class="h4 mb-2">{$dictionary.stopwatchSettings['Display']}</h3>

	<SettingSelect
		id="timestamp-display-select"
		bind:value={$settings.timestamp.displays.primary}
		values={['default', 'tabs']}
		labelMapper={(val) => $dictionary.clockSettings.clockFormats[val]} />
</div>
