<script lang="ts">
	// analog clock theme settings, in accordion, rendered on pages that use analog clock if analog clock is displayed
	import { goto } from '$app/navigation';
	import { slide } from 'svelte/transition';

	import AnalogClock from '$lib/components/features/analog/AnalogClock.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { addToast } from '$lib/components/ui/Toast.svelte';
	import { dictionary } from '$lib/stores/languageDictionary';
	import { settings } from '$lib/stores/settings';
	import { allThemes, userThemes, type Theme } from '$lib/stores/themes';
	import {
		classicNightTheme,
		classicTheme,
		defaultNightTheme,
		defaultTheme,
		emptyTheme
	} from '$lib/themes';
	import { copyURL } from '$lib/util/copy';
	import downloadFile from '$lib/util/downloadFile';
	import mergeDeep from '$lib/util/mergeSettings';
	import { open } from '$lib/util/modal.svelte';
	import { getMinTheme } from '$lib/util/theme';
	import { encodeTheme } from '$lib/util/themeTranscoder';
	import uid from '$lib/util/uid';

	interface Props {
		// @param page - settings to apply changes to
		page: 'clock' | 'worldclock';
	}

	const { page }: Props = $props();
	let importThemeInput = $state() as HTMLInputElement;

	const currentTheme = $derived(
		$allThemes.find((theme) => theme.id == $settings[page].themeID) ??
			JSON.parse(JSON.stringify(defaultTheme))
	);

	async function importTheme(e: Event & { currentTarget: HTMLInputElement }) {
		const inp = e.currentTarget;
		const file = inp.files?.[0];

		if (file) {
			const content = await file.text();
			try {
				const theme = mergeDeep(
					JSON.parse(JSON.stringify(emptyTheme)),
					JSON.parse(content)
				) as Partial<Theme> & { id: string; name: string };
				theme.id = uid();
				$userThemes.unshift(theme);
				$userThemes = $userThemes;
				setTheme(theme);
				const text = $dictionary.messages['Theme imported successfully'];
				const icon = 'success';
				addToast({ text, icon });
				console.log('success uploading theme');
			} catch (err) {
				const text = $dictionary.messages['Error uploading file'];
				const icon = 'error';
				addToast({ text, icon });
				console.log(err);
			}
		}
	}

	function removeTheme(id: string) {
		// if theme to remove is currently in use, set current theme to default
		const defaultDark = !!window.matchMedia('(prefers-color-scheme: dark)').matches;
		if (id === $settings['clock'].themeID) {
			$settings['clock'].themeID = (defaultDark ? defaultNightTheme : defaultTheme).id;
		}
		if (id === $settings['worldclock'].themeID) {
			$settings['worldclock'].themeID = (defaultDark ? defaultNightTheme : defaultTheme).id;
		}

		// remove matching user theme
		$userThemes = $userThemes.filter((theme) => theme.id !== id);
	}

	function setTheme(theme: { id: string }) {
		$settings[page].themeID = theme.id;
	}

	const outOfTheBoxThemes = [defaultTheme, defaultNightTheme, classicTheme, classicNightTheme];
</script>

<div class="flex items-center flex-col justify-between md:flex-row mb-4">
	<h3 class="h4 flex-1">{$dictionary.labels['Themes']}</h3>

	<div class="flex flex-wrap gap-4 lg:gap-6">
		<Button
			animation="move-up"
			icon="upload"
			onclick={() => {
				if ($userThemes.length >= 10) {
					const text =
						$dictionary.messages['You can save at most 10 custom themes. Remove some to add more.'];
					const icon = 'error';
					addToast({ text, icon });
					return;
				}
				importThemeInput.click();
			}}>
			{$dictionary.labels['Upload theme']}
		</Button>

		<Button
			animation="zoom"
			icon="plus"
			onclick={() => {
				if ($userThemes.length >= 10) {
					const text =
						$dictionary.messages['You can save at most 10 custom themes. Remove some to add more.'];
					const icon = 'error';
					addToast({ text, icon });
					return;
				}

				const id = uid();
				const theme = mergeDeep(
					JSON.parse(JSON.stringify(defaultTheme)),
					JSON.parse(JSON.stringify(currentTheme)),
					{ id, name: '' }
				);

				open('modal-new-theme', { theme, page });
			}}>
			{$dictionary.labels['New theme']}
		</Button>
	</div>
</div>

<div class="space-y-2">
	{#each [...$userThemes, ...outOfTheBoxThemes] as clockTheme (clockTheme.id)}
		<div
			class="group relative surface hover:bg-base-200 dark:hover:bg-base-700 rounded overflow-hidden">
			<button
				onclick={() => setTheme(clockTheme)}
				out:slide|local={{ duration: 250 }}
				class="flex items-center justify-between flex-col md:flex-row gap-4 w-full text-left p-2 md:p-4"
				class:border-l-0={clockTheme?.id === currentTheme?.id}>
				<div
					class="absolute left-0 inset-y-0 w-1 bg-base-700 dark:bg-base-200 transition-transform duration-125"
					class:-translate-x-full={clockTheme?.id !== currentTheme?.id}>
				</div>
				<div
					class="relative flex items-center justify-center w-24 aspect-square rounded surface p-2">
					<AnalogClock theme={clockTheme} mode="static" />
				</div>
				<div
					class="flex items-center justify-between flex-col md:flex-row flex-1 pointer-events-none">
					<div class="p-lg flex-1 select-none">
						{$dictionary.clockSettings[clockTheme.name] ?? clockTheme.name}
					</div>
				</div>
			</button>
			<!-- If it's a custom theme -->
			{#if !outOfTheBoxThemes.some((theme) => theme === clockTheme)}
				<div
					class="md:absolute md:right-4 md:top-1/2 md:-translate-y-1/2 z-10 flex flex-row items-center justify-around md:justify-none gap-2 md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100 transition-opacity duration-125 mb-2 md:mb-0">
					<Button
						size="icon"
						icon="pencil"
						variant="ghost"
						onclick={() =>
							open('modal-edit-theme', {
								theme: clockTheme,
								page
							})}
						title={$dictionary.labels['Edit']}>
					</Button>

					<Button
						size="icon"
						icon="link"
						variant="ghost"
						onclick={async () => {
							const theme = getMinTheme(currentTheme);
							const urlParams = new URLSearchParams(window.location.search);
							const id = uid();

							urlParams.set('theme', encodeTheme({ ...theme, id }));
							const url = `${window.location.pathname}?${urlParams.toString()}`;
							await goto(url);
							copyURL($dictionary);
						}}
						title={$dictionary.labels['Copy theme link']}>
					</Button>

					<Button
						size="icon"
						icon="download"
						variant="ghost"
						title={$dictionary.labels['Download theme']}
						onclick={() => {
							const theme = getMinTheme(clockTheme);

							// pretty print json with 2 spaces so users can easily edit
							downloadFile(
								JSON.stringify({ ...theme }, null, 2),
								`${theme.name} - ${$dictionary.labels['Theme']}.txt`
							);
						}}>
					</Button>
					<Button
						size="icon"
						icon="trash"
						variant="ghost"
						onclick={() => removeTheme(clockTheme.id)}
						title={$dictionary.labels['Delete']}>
					</Button>
				</div>
			{/if}
		</div>
	{/each}
</div>

<input
	class="hidden"
	type="file"
	accept=".txt"
	bind:this={importThemeInput}
	onchange={importTheme} />
