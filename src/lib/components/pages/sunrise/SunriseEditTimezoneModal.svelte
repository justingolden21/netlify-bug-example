<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import TimezoneAutocomplete from '$lib/components/features/misc/TimezoneAutocomplete.svelte';
	import { dictionary } from '$lib/stores/languageDictionary';
	import { settings } from '$lib/stores/settings';
</script>

<div class="pad">
	{#if $settings.sunrise.timezone !== null}
		<TimezoneAutocomplete labelID="user-timezone-input" bind:value={$settings.sunrise.timezone} />

		<hr class="my-4" />

		<Button
			icon="target"
			animation="zoom"
			onclick={() => {
				// same code as layout, reset to user device default, but for `sunrise.timezone`
				$settings.sunrise.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
				$settings.sunrise = $settings.sunrise;
			}}>
			{$dictionary.labels['Automatically detect timezone']}
		</Button>
	{/if}
</div>
