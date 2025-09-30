<script lang="ts">
	import { dictionary } from '$lib/stores/languageDictionary';
</script>

<div class="pad">
	{#each $dictionary.pomodoroSettings.pomodoroAboutText as text, idx}
		{#if idx % 2 === 0}
			<h3 class="h4 mt-6 mb-2 first:mt-0">{text}</h3>
		{:else}
			<p class="p">{@html text}</p>
		{/if}
	{/each}
</div>
