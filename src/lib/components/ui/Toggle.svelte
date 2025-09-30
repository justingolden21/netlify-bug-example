<script lang="ts">
	interface Props {
		checked?: boolean;
		id: string;
		labelText: string;
		onchange?: (checked: boolean) => void;
	}

	let { checked = $bindable(false), id, labelText, onchange = () => {} }: Props = $props();
</script>

<!-- todo: find usages of <toggle> and remove wrapper divs when possible, can pass hidden prop to hide -->
<div>
	<div class="relative inline-block w-12 m-2 ml-0 align-middle select-none">
		<input
			bind:checked
			type="checkbox"
			{id}
			class="toggle-checkbox"
			onchange={() => onchange(checked)} />
		<label for={id} class="toggle-bg"></label>
	</div>
	<label for={id} class="label hover:text-base-700 dark:hover:text-base-200 select-none">
		{labelText}
	</label>
</div>

<style global lang="postcss">
	:local(.toggle-checkbox) {
		@apply absolute left-0 block h-6 w-6 cursor-pointer appearance-none rounded-full border-4 border-base-300 bg-white dark:border-base-500 dark:bg-base-100;
		transition: left 0.25s;
	}
	:local(.toggle-checkbox):checked {
		@apply left-6 border-accent-700 dark:border-accent-700;
	}
	:local(.toggle-checkbox) + :local(.toggle-bg) {
		@apply block h-6 cursor-pointer overflow-hidden rounded-full bg-base-400 transition-colors dark:bg-base-600;
	}
	:local(.toggle-checkbox):checked + :local(.toggle-bg) {
		@apply bg-accent-700 dark:bg-accent-700;
	}
</style>
