<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import { dictionary } from '$lib/stores/languageDictionary';
	import { open } from '$lib/util/modal.svelte';
</script>

<!-- Similar classes to nav in nav.svelte -->
<nav
	class="
	sticky
	bottom-0
	z-10
	surface
	border-0
	border-t-2
	h-16
	p-2
	grid
	grid-cols-3
	w-full">
	<Button
		icon="table"
		size="adaptive"
		variant="ghost"
		className="mx-auto"
		onclick={() => open('worldclock-timetable')}
		aria-label={$dictionary.worldclockSettings['Timetable view']}
		title={$dictionary.worldclockSettings['Timetable view']}>
		<span class="hidden lg:inline">{$dictionary.worldclockSettings['Timetable']}</span>
	</Button>
	<Button
		icon="switch_horizontal"
		size="adaptive"
		variant="ghost"
		className="mx-auto"
		onclick={() => open('convert-timezones')}
		aria-label={$dictionary.worldclockSettings['Convert timezones']}
		title={$dictionary.worldclockSettings['Convert timezones']}>
		<span class="hidden lg:inline">{$dictionary.worldclockSettings['Convert']}</span>
	</Button>
	<Button
		icon="plus"
		size="adaptive"
		variant="ghost"
		className="mx-auto"
		onclick={() => open('new-worldclock')}
		aria-label={$dictionary.worldclockSettings['New timezone']}
		title={$dictionary.worldclockSettings['New timezone']}>
		<span class="hidden lg:inline">{$dictionary.labels['New']}</span>
	</Button>
</nav>
