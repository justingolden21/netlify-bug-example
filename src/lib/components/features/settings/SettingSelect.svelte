<script lang="ts">
	// select logic used to bind value to a specific setting and has label mapper to use dictionary values
	import type { ChangeEventHandler } from 'svelte/elements';

	import { systemFontFamilies } from '$lib/data/consts';

	type LabelMapper = (value: string | number, idx: number) => string;

	/**
	 * Props used by {@link SettingSelect}.
	 *
	 * @property id - id of select and for label
	 * @property selectLabel - label text
	 * @property showLabel - whether to display the label
	 * @property value - current value of select (can be bound)
	 * @property disabled - disabled attribute of select
	 * @property values - list of option values
	 * @property labels - map of option value to label text
	 * @property onchange - change event handler
	 * @property labelMapper - custom function mapping a value to a label string
	 * @property dynamicFont - true if each option should have a font family according to its value (for font family pickers)
	 */
	interface Props {
		id?: string | undefined;
		selectLabel?: string;
		showLabel?: boolean;
		value: string | number | null;
		disabled?: boolean;
		values?: Readonly<(string | number)[]>;
		labels?: Record<string | number, string> | undefined;
		onchange?: ChangeEventHandler<HTMLSelectElement> | undefined;
		labelMapper?: LabelMapper;
		dynamicFont?: boolean;
	}

	let {
		id = undefined,
		selectLabel = '',
		showLabel = true,
		value = $bindable(),
		disabled = false,
		values = $bindable([]),
		labels = undefined,
		onchange = undefined,
		labelMapper = (value) => (labels ? labels[value] : String(value)),
		dynamicFont = false
	}: Props = $props();

	// TODO: can we delete this?
	// HACK: svelte has no way of knowing other than this that the labelMapper depends on labels
	// Update the values when labels changes, so the dropdown has the correct values
	$effect(() => {
		if (labels) values = values;
	});
</script>

{#if selectLabel && showLabel}
	<label for={id} class="label">{selectLabel}</label>
{/if}

<!--
	The change listener is basically `onchange={onchange}`
	except we copy the event so the currentTarget doesn't change.
	Otherwise, the component wouldn't work.
	We use `currentTarget` instead of `target` to make TypeScript happy.
 -->
<select
	{id}
	{disabled}
	aria-label={selectLabel}
	bind:value
	onchange={(e) => onchange?.({ ...e, currentTarget: e.currentTarget })}>
	{#each values as val, idx}
		<option
			value={val}
			style={dynamicFont && val === ''
				? `font-family:${systemFontFamilies}`
				: `font-family:${dynamicFont ? val : ''}`}>{labelMapper(val, idx)}</option>
	{/each}
</select>
