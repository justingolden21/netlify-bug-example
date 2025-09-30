<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';

	import { dictionary } from '$lib/stores/languageDictionary';
	import { settings } from '$lib/stores/settings';
	import isTauri from '$lib/util/isTauri';
	import { close } from '$lib/util/modal.svelte';
	import shareApp from '$lib/util/shareApp';

	// `__version__` has to be used in script tag for linting
	const version = __version__;
</script>

<div class="pad">
	<h3 class="h4 mb-2">{$dictionary.settingsTabs['About']}</h3>
	<p class="p">
		{$dictionary.about.aboutText}
	</p>
	<p class="p mt-4">
		{$dictionary.about.shareText.split('{{sharing}}')[0]}
		{#if browser && navigator.share !== undefined}
			<button class="a" onclick={() => shareApp($dictionary, page.url.pathname)}>
				{$dictionary.about['sharing']}
			</button>
		{:else}
			<span>{$dictionary.about['sharing']}</span>
		{/if}
		{$dictionary.about.shareText.split('{{sharing}}')[1]}
	</p>
	<p class="p mt-4">
		{$dictionary.about['Version']}
		{version}
		{isTauri() ? 'tauri' : ''}
		{import.meta.env.PROD ? 'prod' : 'dev'}
		| <a class="a" href="/changelog" onclick={close}>{$dictionary.pageNames['changelog']}</a>
	</p>

	{#if ($dictionary.about.suggestBetterTranslation !== '' || $dictionary.about.translationCredit !== '') && $settings.locale.language !== 'en'}
		<h3 class="h4 mt-6 mb-2">{$dictionary.about['Translation']}</h3>
		<p class="p">
			{@html $dictionary.about.suggestBetterTranslation.replace(
				'{{email}}',
				'<a class="a" href="mailto:contact@justingolden.me?subject=Desktop%20Clock" target="_blank" rel="noopener noreferrer">contact@justingolden.me</a>'
			)}
		</p>
		<p class="p">
			{$dictionary.about.translationCredit}
		</p>
	{/if}

	<hr class="my-4" />

	<h3 class="h4 mt-6 mb-2">{$dictionary.about['Contact']}</h3>
	<p class="p">
		{@html $dictionary.about.contactText
			.replace(
				'{{author}}',
				'<a class="a" href="https://justingolden.me" target="_blank" rel="noopener noreferrer">Justin Golden</a>'
			)
			.replace(
				'{{email}}',
				'<a class="a" href="mailto:contact@justingolden.me?subject=Desktop%20Clock" target="_blank" rel="noopener noreferrer">contact@justingolden.me</a>'
			)}
	</p>
	<p class="p mt-4">
		{@html $dictionary.about.thanksText
			.replace(
				'Raqueebuddin Aziz',
				'<a class="a" href="https://raqueebuddinaziz.com/" target="_blank" rel="noopener noreferrer">Raqueebuddin Aziz</a>'
			)
			.replace(
				'रकीबुद्दीन अजीज',
				'<a class="a" href="https://raqueebuddinaziz.com/" target="_blank" rel="noopener noreferrer">रकीबुद्दीन अजीज</a>'
			)}
	</p>
</div>
