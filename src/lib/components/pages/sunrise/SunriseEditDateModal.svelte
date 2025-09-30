<script lang="ts">
	import { now } from '$lib/util/now.svelte';
	import dayjs from 'dayjs';

	import Button from '$lib/components/ui/Button.svelte';
	import { dictionary } from '$lib/stores/languageDictionary';
	import { settings } from '$lib/stores/settings';

	const dateDisplay = $derived(
		dayjs($settings.sunrise.date === -1 ? now.value : new Date($settings.sunrise.date)).format(
			'YYYY-MM-DD'
		)
	); // this format is necessary for the vanilla html date input value
</script>

<div class="pad">
	<!--
		TODO: polyfill for date input (old safari, old ff, ie)
		@link https://stackoverflow.com/a/45749160/4907950
		Use 'better-dateinput-polyfill' or 'html5-simple-date-input-polyfill'
	-->
	<input
		value={dateDisplay}
		type="date"
		onchange={(evt) => {
			if (evt && evt.currentTarget && evt.currentTarget.value) {
				$settings.sunrise.date = new Date(evt.currentTarget.value).getTime();
			}
		}} />

	<hr class="my-4" />

	<Button icon="target" animation="zoom" onclick={() => ($settings.sunrise.date = -1)}>
		{$dictionary.sunriseSunsetSettings["Use today's date"]}
	</Button>
</div>
