<script lang="ts">
	import Changelogs from '$lib/components/pages/changelog/Changelogs.svelte';
	import { dictionary } from '$lib/stores/languageDictionary';
</script>

<div class="page-container">
	<Changelogs changelogs={$dictionary.changelog} />
</div>
