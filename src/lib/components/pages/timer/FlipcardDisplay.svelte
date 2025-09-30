<script lang="ts">
	import { onMount } from 'svelte';

	import Flipcard from '$lib/components/pages/timer/Flipcard.svelte';
	import { dictionary } from '$lib/stores/languageDictionary';
	import { settings } from '$lib/stores/settings';
	import getTranslatedTimefield from '$lib/util/getTranslatedTimefield';

	interface Props {
		secRemaining: number;
		name?: string;
		isFullscreen?: boolean;
	}

	const { secRemaining, name = '', isFullscreen = false }: Props = $props();

	let days = $state(0);
	let hours = $state(0);
	let minutes = $state(0);
	let seconds = $state(0);
	const locale = $derived($settings.locale.language ?? 'en');

	function updateCountdown(first: boolean = false) {
		const now = new Date();
		const msUntilNextSecond = 1000 - now.getMilliseconds();

		setTimeout(
			() => {
				days = Math.floor(secRemaining / (60 * 60 * 24));
				hours = Math.floor((secRemaining % (60 * 60 * 24)) / (60 * 60));
				minutes = Math.floor((secRemaining % (60 * 60)) / 60);
				seconds = Math.floor(secRemaining % 60);

				updateCountdown();
			},
			first ? 0 : msUntilNextSecond
		);
	}

	onMount(() => updateCountdown(true));
</script>

<div class="flex gap-2 lg:gap-4">
	{#if days !== 0}
		<div class="flex flex-col items-center gap-2">
			<Flipcard value={days} {isFullscreen} />
			<span>{getTranslatedTimefield(locale, 'day', days !== 1, true)}</span>
		</div>
	{/if}
	<div class="flex flex-col items-center gap-2">
		<Flipcard value={hours} {isFullscreen} />
		<span>{getTranslatedTimefield(locale, 'hour', true, true)}</span>
	</div>
	<div class="flex flex-col items-center gap-2">
		<Flipcard value={minutes} {isFullscreen} />
		<span>{getTranslatedTimefield(locale, 'minute', true, true)}</span>
	</div>
	<div class="flex flex-col items-center gap-2">
		<Flipcard value={seconds} {isFullscreen} />
		<span>{getTranslatedTimefield(locale, 'second', true, true)}</span>
	</div>
</div>

{#if name !== ''}
	<span class="text-3xl">{$dictionary.timerSettings['until']} <b>{name}</b></span>
{/if}
