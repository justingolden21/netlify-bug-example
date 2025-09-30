<script lang="ts">
	type Breadcrumb = {
		label: string;
		href?: string;
	};

	interface Props {
		items?: Breadcrumb[];
	}

	const { items = [] }: Props = $props();
</script>

<nav aria-label="Breadcrumb" class="flex flex-wrap items-center space-x-2">
	{#each items as item, idx}
		{#if idx < items.length - 1}
			<a href={item.href} class="a">{item.label}</a>
			<span>/</span>
		{:else}
			<span aria-current="page">{item.label}</span>
		{/if}
	{/each}
</nav>
