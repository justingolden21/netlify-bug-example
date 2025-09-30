<script lang="ts">
	import VectorArt from '$lib/components/features/misc/VectorArt.svelte';
	import {
		defaultTimezones,
		defaultExtendedTimezones
	} from '$lib/components/pages/worldclock/WorldclockSettings.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { dictionary } from '$lib/stores/languageDictionary';
	import { settings } from '$lib/stores/settings';
	import { open } from '$lib/util/modal.svelte';
</script>

<div class="select-none w-80 xl:w-96 mx-auto mb-10">
	<VectorArt name="alarm_clock" />
</div>
<p class="p-lg text-center mb-10">
	{$dictionary.worldclockSettings["You don't have any other worldclocks. Try adding a new one"]}
</p>

<div class="text-center flex flex-wrap justify-center gap-4 lg:gap-6">
	<!-- Copied from `WorldclockTray.svelte`: -->
	<Button
		icon="plus"
		animation="zoom"
		variant="outline"
		onclick={() => open('new-worldclock')}
		title={$dictionary.worldclockSettings['New timezone']}>
		{$dictionary.labels['New']}
	</Button>
	<!-- Copied from `WorldclockSettings.svelte` -->
	<Button
		icon="undo"
		animation="move-left"
		variant="outline"
		onclick={() => ($settings.worldclock.timezones = [...defaultTimezones])}>
		{$dictionary.worldclockSettings['Set default timezones']}
	</Button>
	<Button
		icon="undo"
		animation="move-left"
		variant="outline"
		onclick={() => ($settings.worldclock.timezones = [...defaultExtendedTimezones])}>
		{$dictionary.worldclockSettings['Set extended default timezones']}
	</Button>
</div>
