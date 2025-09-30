<script lang="ts">
	/**
	 * A generic card component
	 * Renders a rectangular card with an icon, title, description, and link
	 * Used by `PageCard`
	 */
	import Icon, { type TIcon } from '$lib/components/ui/Icon.svelte';
	import PageIcon from '$lib/components/ui/PageIcon.svelte';

	interface Props {
		icon?: TIcon | undefined;
		pageIcon?: PageIcons | undefined;
		title: string;
		description?: string;
		link: string;
		children?: import('svelte').Snippet;
	}

	const {
		icon = undefined,
		pageIcon = undefined,
		title,
		description = '',
		link,
		children
	}: Props = $props();
</script>

<div class="surface hover:bg-base-300 dark:hover:bg-base-600 text-center">
	<a href={link} class="block hover:no-underline pad h-full">
		{#if icon}
			<Icon name={icon} size="lg" strokeWidth="thin" className="text-base-700 dark:text-base-200" />
		{:else if pageIcon}
			<div class="inline-block w-10 h-10">
				<PageIcon page={pageIcon} strokeWidth="thin" />
			</div>
		{/if}
		<h2 class="h2 font-light mt-4">{title}</h2>
		{#if description !== ''}
			<p class="p mt-4 text-left">{description}</p>
		{/if}
	</a>
	{@render children?.()}
</div>
