<script lang="ts">
	import getFormat from '$lib/util/getFormat';
	import { now } from '$lib/util/now.svelte';
	import { getDateTime } from '$lib/util/timeText';

	interface Props {
		classes?: string;
		mode?: 'time' | 'date';
	}

	const { classes = '', mode = 'time' }: Props = $props();

	const time = $derived(getDateTime(now.value, getFormat('clock', mode)));
</script>

<time class={classes}>{time}</time>
