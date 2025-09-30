<script lang="ts">
	/**
	 * Settings component for `/rubikscube` settings
	 *
	 * The user can change their display, timer settings, and view sessions
	 */

	import SettingSelect from '$lib/components/features/settings/SettingSelect.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import { dictionary } from '$lib/stores/languageDictionary';
	import { defaultSettings, settings } from '$lib/stores/settings';
	import { open } from '$lib/util/modal.svelte';
</script>

<div class="pad">
	<h3 class="h4 mb-2">{$dictionary.clockSettings['Displays']}</h3>

	<div class="mb-4">
		<SettingSelect
			id="primary-display-select"
			selectLabel={$dictionary.clockSettings['Primary display:']}
			bind:value={$settings.rubiks.displays.primary}
			values={['timer', 'timer_and_times']}
			labels={$dictionary.clockSettings.clockFormats} />
	</div>

	<div class="mb-4">
		<SettingSelect
			id="secondary-display-select"
			selectLabel={$dictionary.clockSettings['Secondary display:']}
			bind:value={$settings.rubiks.displays.secondary}
			values={['scramble', 'times', 'none']}
			labels={$dictionary.clockSettings.clockFormats} />
	</div>

	<Toggle
		id="show-rubiks-bg-toggle"
		bind:checked={$settings.rubiks.display.showBackground}
		labelText={$dictionary.labels['Show rubiks cube decorative background']} />

	<hr class="my-10" />

	<h3 class="h4 mb-2">{$dictionary.rubiksSettings['Timer Settings']}</h3>

	<Toggle
		id="generate-scramble-timer-stop-toggle"
		bind:checked={$settings.rubiks.generateScrambleOnTimerStop}
		labelText={$dictionary.labels['Generate new scramble on timer stop']} />

	<hr class="my-10" />

	<div class="flex flex-wrap gap-4 lg:gap-6">
		<Button size="lg" icon="list" animation="move-up" onclick={() => open('rubiks-sessions')}>
			{$dictionary.rubiksSettings['Sessions']}
		</Button>
		<Button
			size="lg"
			icon="cube"
			animation="move-up"
			onclick={() =>
				open('rubiks-single-session', { sessionID: $settings.rubiks.currentSessionID })}>
			{$dictionary.rubiksSettings['Current session']}
		</Button>
		<Button
			size="lg"
			icon="cube"
			animation="move-up"
			onclick={() => open('rubiks-interactable-cube')}>
			{$dictionary.rubiksSettings['Interactable Cube']}
		</Button>
	</div>

	<br />

	<Button
		size="lg"
		icon="undo"
		animation="move-left"
		onclick={() => {
			// Reset all `rubiks` settings while saving the user sessions and session ID, current timer, and current scramble
			const userSessions = JSON.parse(JSON.stringify($settings.rubiks.sessions));
			const userTimer = JSON.parse(JSON.stringify($settings.rubiks.timer));
			const currentSessionID = $settings.rubiks.currentSessionID;
			const scramble = $settings.rubiks.scramble;

			$settings.rubiks = JSON.parse(JSON.stringify(defaultSettings.rubiks));

			$settings.rubiks.sessions = userSessions;
			$settings.rubiks.timer = userTimer;
			$settings.rubiks.currentSessionID = currentSessionID;
			$settings.rubiks.scramble = scramble;
		}}>
		{$dictionary.rubiksSettings['Reset rubiks cube settings']}
	</Button>
</div>
