<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';

	import Birthdays from '$lib/components/pages/birthdays/Birthdays.svelte';
	import birthdaysImport from '$lib/util/birthdaysImport';

	onMount(() => {
		if (page.url.searchParams.has('birthdays')) {
			const success = birthdaysImport(page.url.searchParams.get('birthdays') ?? '');
			// Remove `birthdays` from url param after successful import
			if (success) {
				const params = new URLSearchParams(window.location.search);
				params.delete('birthdays');
				history.replaceState(null, '', `${window.location.pathname}?${params}`);
			}
		}
	});
</script>

<section class="page-container xl:h-full">
	<Birthdays />
</section>
