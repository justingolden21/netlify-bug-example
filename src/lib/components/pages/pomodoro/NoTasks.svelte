<script lang="ts">
	import VectorArt from '$lib/components/features/misc/VectorArt.svelte';
	import { dictionary } from '$lib/stores/languageDictionary';
</script>

<!-- Similar to `NoTimezones.svelte` -->
<div class="select-none w-80 xl:w-96 mx-auto mb-10">
	<VectorArt name="no_tasks" />
</div>
<p class="p-lg text-center mb-10">
	{$dictionary.pomodoroSettings["You don't have any tasks. Try adding a new one"]}
</p>
