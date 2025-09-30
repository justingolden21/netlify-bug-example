<script lang="ts">
	/**
	 * Timestamp section to display current timestamp in s, ms, hex (s), as well as datetime strings
	 */

	import { onMount } from 'svelte';

	import Button from '$lib/components/ui/Button.svelte';
	import { addToast } from '$lib/components/ui/Toast.svelte';
	import { dictionary } from '$lib/stores/languageDictionary';
	import { copyText } from '$lib/util/copy';

	let timestamp: number = $state(0);
	let timestampMs: number = $state(0);
	let timestampHex: string = $state('');
	let localDateTime: string = $state('');
	let dateTimeUTC: string = $state('');
	let dateTimeISO: string = $state('');

	onMount(() => {
		updateTime();
		const itvl = setInterval(updateTime, 1000);
		return () => clearInterval(itvl);
	});

	function updateTime() {
		const now = new Date();
		timestampMs = now.getTime();
		timestamp = Math.floor(now.getTime() / 1000);
		timestampHex = timestamp.toString(16).toUpperCase();
		localDateTime = now.toLocaleString();
		dateTimeUTC = now.toUTCString();
		dateTimeISO = now.toISOString();
	}

	function copyToClipboard(text: string) {
		copyText(text).then((success) => {
			const text = success
				? $dictionary.messages['Copied successfully']
				: $dictionary.messages['Failed to copy'];
			const icon = success ? 'success' : 'error';
			addToast({ text, icon });
		});
	}
</script>

<h2 class="h2 mb-2">{$dictionary.timestampSettings.sectionTitles['Current Unix Timestamp']}</h2>

<div class="flex items-center gap-2 my-2">
	<p class="h1">{timestamp}</p>
	<Button
		onclick={() => copyToClipboard(timestamp.toString())}
		icon="copy"
		size="icon"
		animation="flip-horizontal"
		variant="outline"
		title={$dictionary.labels['Copy']}>
	</Button>
</div>
<p class="text-sm mb-4">{$dictionary.timestampSettings.current['Seconds since Jan 1, 1970 UTC']}</p>

<hr class="my-4" />

{#each [{ title: 'Timestamp milliseconds', value: timestampMs }, { title: 'Timestamp hex', value: timestampHex }, { title: 'Local', value: localDateTime }, { title: 'UTC', value: dateTimeUTC }, { title: 'ISO', value: dateTimeISO }] as item}
	<div class="flex flex-col sm:flex-row items-end gap-2 mb-6 sm:mb-2">
		{$dictionary.timestampSettings.current.titles[item.title]}:
		<span class="text-xl">{item.value}</span>
		<Button
			icon="copy"
			size="icon"
			iconSize="sm"
			animation="flip-horizontal"
			variant="outline"
			className="p-1 w-auto h-auto"
			onclick={() => copyToClipboard(item.value.toString())}
			title={$dictionary.labels['Copy']}>
		</Button>
	</div>
{/each}
