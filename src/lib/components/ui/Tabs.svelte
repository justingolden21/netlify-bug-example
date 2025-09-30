<script module lang="ts">
	export interface Tab {
		name: string;
		content?: Component;
		icon?: TIcon;
		onclick?: () => void;
		href?: string;
	}
</script>

<script lang="ts">
	import type { Component } from 'svelte';
	import { fade } from 'svelte/transition';

	import Icon, { type TIcon } from '$lib/components/ui/Icon.svelte';

	interface Props {
		hideOverflow?: boolean;
		tabs: Tab[];
		activeTab?: number;
		alwaysColumn?: boolean;
		sticky?: boolean;
		spaceBelow?: boolean;
		links?: boolean;
	}

	let {
		hideOverflow = false,
		tabs,
		activeTab = $bindable(0),
		alwaysColumn = false,
		sticky = true,
		spaceBelow = false,
		links = false
	}: Props = $props();

	const ActiveTabComponent = $derived(tabs[activeTab]?.content);
</script>

<div class="flex flex-col h-full">
	<!-- Tab list -->
	<div
		class="z-10 mx-auto w-full md:flex {sticky ? 'md:sticky md:top-0' : ''} 
		{alwaysColumn ? 'flex-wrap' : ''} {spaceBelow ? 'mb-10' : ''}">
		{#each tabs as tab, idx}
			{@const isActive = idx === activeTab}
			{@const classes = `mx-auto w-full cursor-pointer items-center justify-center rounded-none border-b-2 px-4 py-2 font-normal leading-none text-base-700 hover:bg-base-100 sm:py-4 md:inline-flex dark:text-base-200 dark:hover:bg-base-700 p transition-colors duration-125 inline-block text-center ${isActive ? 'bg-base-100 dark:bg-base-700' : ''} ${
				isActive && alwaysColumn
					? // Bottom border all sizes
						'border-accent-700'
					: isActive && !alwaysColumn
						? // Bottom border only on md+ sizes
							'border-accent-700 md:border-base-300 md:dark:border-base-600'
						: // Non active tabs / fallback
							'border-base-300 dark:border-base-600'
			}`}
			<!-- Tab -->
			{#if links}
				<a class={classes} href={tab.href}>
					{#if tab.icon}
						<Icon name={tab.icon} className="mr-2" />
					{/if}
					{tab.name}
				</a>
			{:else}
				<button
					class={classes}
					onclick={() => {
						activeTab = idx;
						if (tab.onclick) tab.onclick();
					}}>
					{#if tab.icon}
						<Icon name={tab.icon} className="mr-2" />
					{/if}
					{tab.name}
				</button>
			{/if}
		{/each}
		{#if !alwaysColumn}
			<!-- Tab slider -->
			<div
				class="absolute bottom-0 left-0 hidden h-[0.125rem] w-full origin-top-left bg-accent-700 transition-transform md:block dark:bg-accent-700"
				role="presentation"
				style="transform: translateX({(activeTab / tabs.length) * 100}%) scaleX({1 /
					tabs.length});">
			</div>
		{/if}
	</div>

	{#key activeTab}
		<div in:fade={{ duration: 250 }} class="grow" class:overflow-hidden={hideOverflow}>
			<ActiveTabComponent />
		</div>
	{/key}
</div>
