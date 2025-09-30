<script lang="ts">
	// header - contains page title, menu, and quick action buttons
	import { page } from '$app/state';

	
	import { dictionary } from '$lib/stores/languageDictionary';
	import { settings } from '$lib/stores/settings';

	interface Props {
		navOpen: boolean;
	}

	let { navOpen = $bindable() }: Props = $props();



	
</script>


<!-- Cover the page in a div with `cursor-none` that only appears when idle
to hide the cursor when idle -->
<div
	id="cursor-cover"
	class="fixed left-0 top-0 w-full h-full z-30 ">
</div>

<header class="relative w-full print:hidden p-4">

	{#if navOpen && !$settings.smallerMenu}
		<div
			class="inline z-30 absolute w-10 ml-16
		{$settings.alwaysCollapseMenu || true ? '' : 'md:hidden'}">
			
		</div>
	{/if}

	<!-- Hide top buttons on short screens and fade out if idle -
		do this here instead of `<header>` because otherwise we hide the nav controls -->
	<div
		class="flex items-start gap-2 short:hidden short:h-0 transition-opacity ">
		<div
			class="isolate z-10 inline-block ml-16 {$settings.alwaysCollapseMenu || true
				? ''
				: 'md:ml-0'}">
			

			<!-- only show toggle display buttons on pages with toggleable displays -->
			

		
		</div>

		<span class="grow"></span>
		<h1
			class="hidden sm:flex md:hidden lg:flex self-center items-center justify-center gap-4 absolute left-0 right-0 pointer-events-none">
			<div class="inline-block w-6 h-6">
			
			</div>
			<span class="h4">
				{$dictionary.pageNames[page.url.pathname.substring(1) || 'clock'] || ''}
			</span>
		</h1>

		
	</div>
</header>
