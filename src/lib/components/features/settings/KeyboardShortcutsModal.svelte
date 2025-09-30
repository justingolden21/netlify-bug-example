<script lang="ts">
	// displays a table of keyboard shortcuts available
	import { getKeys } from '$/types';
	import { keyboardShortcutsList } from '$lib/components/features/settings/KeyboardShortcuts.svelte';
	import { dictionary } from '$lib/stores/languageDictionary';

	const shortcuts = $derived(getKeys(keyboardShortcutsList));
</script>

<div class="pad">
	<table class="p striped">
		<thead>
			<tr>
				<th>{$dictionary.keyboardShortcuts['Key']}</th>
				<th>{$dictionary.keyboardShortcuts['Action']}</th>
			</tr>
		</thead>
		<tbody>
			{#each shortcuts as shortcut}
				{#if shortcut != 'B' || (navigator && 'getBattery' in navigator && navigator.getBattery)}
					<tr>
						<td>{shortcut}</td>
						<td>{$dictionary.labels[keyboardShortcutsList[shortcut]]}</td>
					</tr>
				{/if}
			{/each}
		</tbody>
	</table>
</div>
