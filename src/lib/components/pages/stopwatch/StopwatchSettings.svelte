<script lang="ts">
	import SettingSelect from '$lib/components/features/settings/SettingSelect.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import { dictionary } from '$lib/stores/languageDictionary';
	import { defaultSettings, settings } from '$lib/stores/settings';

	const stopAllStopwatches = () => {
		for (const stopwatch of $settings.stopwatch.stopwatches) {
			if (stopwatch.times.length % 2 !== 0) {
				// if starting, then stop it
				stopwatch.times.push(Date.now());
			}
		}
	};
	const startAllStopwatches = () => {
		for (const stopwatch of $settings.stopwatch.stopwatches) {
			if (stopwatch.times.length % 2 === 0) {
				// if stopped, then start it
				stopwatch.times.push(Date.now());
			}
		}
	};

	const resetStopwatchSettings = () => {
		// don't delete user's stopwatches
		const userStopwatches = JSON.parse(JSON.stringify($settings.stopwatch.stopwatches));
		$settings.stopwatch = JSON.parse(JSON.stringify(defaultSettings.stopwatch));
		$settings.stopwatch.stopwatches = userStopwatches;
	};
</script>

<div class="pad">
	<h3 class="h4 mb-2">{$dictionary.stopwatchSettings['Display']}</h3>

	<Toggle
		id="always-show-hours-toggle"
		bind:checked={$settings.stopwatch.alwaysShowHours}
		labelText={$dictionary.stopwatchSettings['Always show hours']} />

	<SettingSelect
		id="digits-after-seconds-select"
		selectLabel={$dictionary.stopwatchSettings['Digits after seconds']}
		bind:value={$settings.stopwatch.digitsAfterSeconds}
		values={[...Array(4).keys()]} />

	<br />

	<SettingSelect
		id="digits-after-seconds-lap-list-select"
		selectLabel={$dictionary.stopwatchSettings['Digits after seconds in lap list']}
		bind:value={$settings.stopwatch.digitsAfterSecondsLapList}
		values={[...Array(4).keys()]} />

	<hr class="my-4" />

	<Toggle
		id="show-laps-chart-toggle"
		bind:checked={$settings.stopwatch.showLapsChart}
		labelText={$dictionary.stopwatchSettings['Show laps chart']} />

	<Toggle
		id="show-reset-button-toggle"
		bind:checked={$settings.stopwatch.showResetButton}
		labelText={$dictionary.stopwatchSettings['Show reset stopwatch button']} />

	<Toggle
		id="namable-stopwatches-toggle"
		bind:checked={$settings.stopwatch.namableStopwatches}
		labelText={$dictionary.stopwatchSettings['Namable stopwatches']} />

	<Toggle
		id="reverse-order-laps-toggle"
		bind:checked={$settings.stopwatch.reverseOrderLaps}
		labelText={$dictionary.stopwatchSettings['Reverse lap order']} />

	<Toggle
		id="larget-first-stopwatch-toggle"
		bind:checked={$settings.stopwatch.largerFirstStopwatch}
		labelText={$dictionary.stopwatchSettings['First stopwatch is larger']} />

	<hr class="my-10" />

	<h3 class="h4 mb-2">{$dictionary.stopwatchSettings['Behavior']}</h3>

	<Toggle
		id="auto-start-stopwatches-toggle"
		bind:checked={$settings.stopwatch.autoStartStopwatches}
		labelText={$dictionary.stopwatchSettings['Automatically start new stopwatches']} />

	<div class="mt-4 flex flex-wrap gap-4 lg:gap-6">
		<Button icon="stopwatch" animation="move-right" onclick={startAllStopwatches}>
			{$dictionary.stopwatchSettings['Start all paused stopwatches']}
		</Button>
		<Button icon="stopwatch" animation="move-right" onclick={stopAllStopwatches}>
			{$dictionary.stopwatchSettings['Stop all running stopwatches']}
		</Button>
	</div>

	<hr class="my-10" />

	<Button icon="undo" animation="move-left" onclick={resetStopwatchSettings}>
		{$dictionary.stopwatchSettings['Reset stopwatch settings']}
	</Button>
</div>
