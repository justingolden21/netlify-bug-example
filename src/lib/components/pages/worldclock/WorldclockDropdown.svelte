<script lang="ts">
	import ThreeDotMenu, { type Option } from '$lib/components/ui/ThreeDotMenu.svelte';
	import { settings } from '$lib/stores/settings';
	import { open } from '$lib/util/modal.svelte';

	interface Props {
		idx?: number;
		classes?: string;
	}

	const { idx = -1, classes = '' }: Props = $props();

	const options = $derived([
		{
			text: 'Edit',
			icon: 'pencil',
			func: () => open('edit-worldclock', { editIndex: idx })
		},
		{
			text: 'Up',
			icon: 'chevron_up',
			func: () => {
				moveItem($settings.worldclock.timezones, idx, idx - 1);
			},
			hidden: idx === 0
		},
		{
			text: 'Down',
			icon: 'chevron_down',
			func: () => {
				moveItem($settings.worldclock.timezones, idx, idx + 1);
			},
			hidden: idx === $settings.worldclock.timezones.length - 1
		},
		{
			text: 'Delete',
			icon: 'trash',
			func: () => {
				$settings.worldclock.timezones = $settings.worldclock.timezones.filter((_, i) => i !== idx);
			}
		}
	] as Option[]);

	// remove `from` item and insert into position `to`
	// https://stackoverflow.com/a/46351038/4907950
	function moveItem(data: unknown[], from: number, to: number) {
		data.splice(to, 0, data.splice(from, 1)[0]);
		// fix for reactivity in dropdown options when moving items up/down
		$settings.worldclock.timezones = $settings.worldclock.timezones;
	}
</script>

<ThreeDotMenu {classes} {idx} {options} />
