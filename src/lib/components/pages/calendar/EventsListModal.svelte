<script lang="ts">
	import { flip } from 'svelte/animate';
	import { fade, scale } from 'svelte/transition';

	import VectorArt from '$lib/components/features/misc/VectorArt.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { dictionary } from '$lib/stores/languageDictionary';
	import { settings } from '$lib/stores/settings';
	import { getEventDescription } from '$lib/util/eventManager';
	import { deleteAllEvents, deleteEvent, openNewEvent } from '$lib/util/eventListActions';
	import { open } from '$/lib/util/modal.svelte';

	const confirmBeforeDeleting = $derived($settings.calendar.confirmBeforeDeleting);

	/**
	 * Prompt before removing a single event by id.
	 * @param eventId Identifier of the event to remove
	 */
	function handleDelete(eventId: string) {
		if (!confirmBeforeDeleting) {
			$settings.calendar.events = deleteEvent($dictionary, $settings.calendar.events, eventId);
			return;
		}

		open('confirm-modal', {
			message: $dictionary.messages['Delete item?'],
			confirmText: $dictionary.labels['Delete'],
			cancelText: $dictionary.labels['Close'],
			confirmIcon: 'trash',
			onConfirm: () => {
				$settings.calendar.events = deleteEvent($dictionary, $settings.calendar.events, eventId);
			}
		});
	}

	/** Prompt before deleting every event. */
	function handleDeleteAll() {
		if (!confirmBeforeDeleting) {
			$settings.calendar.events = deleteAllEvents($dictionary);
			return;
		}

		open('confirm-modal', {
			message: $dictionary.messages['Delete all items?'],
			confirmText: $dictionary.labels['Delete all'],
			cancelText: $dictionary.labels['Close'],
			confirmIcon: 'trash',
			onConfirm: () => {
				$settings.calendar.events = deleteAllEvents($dictionary);
			}
		});
	}

	/**
	 * Open the new-event modal unless event limit reached.
	 */
	function handleNewEvent() {
		openNewEvent($dictionary, $settings.calendar.events.length);
	}
</script>

<div class="pad overflow-y-auto">
	{#if $settings.calendar.events.length === 0}
		<div class="select-none w-80 xl:w-96 mx-auto">
			<VectorArt name="calendar" />
		</div>
		<h3 class="p-lg mt-10 text-center">
			{$dictionary.calendarEvents['You have no events. Try adding a new one']}
		</h3>
	{:else}
		<div class="grid gap-4">
			{#each $settings.calendar.events as event (event.id)}
				<div
					animate:flip={{ duration: 250 }}
					in:scale|local={{ duration: 250 }}
					out:fade|local={{ duration: 125 }}
					class="surface p-4 flex items-center justify-between gap-4">
					<div>
						<h3 class="h3">{event.title || $dictionary.labels['Untitled']}</h3>
						<p class="p-sm">
							{getEventDescription(
								event,
								$settings.calendar.ampm ?? undefined,
								$dictionary,
								$settings.locale.language ?? 'en'
							)}
						</p>
					</div>
					<div class="flex gap-2">
						<Button
							size="icon"
							variant="ghost"
							icon="pencil"
							title={$dictionary.labels['Edit']}
							onclick={() => open('edit-event-modal', { eventId: event.id })} />
						<Button
							size="icon"
							variant="ghost"
							icon="trash"
							title={$dictionary.labels['Delete']}
							onclick={() => handleDelete(event.id)} />
					</div>
				</div>
			{/each}
		</div>
	{/if}

	<div class="mt-6 flex justify-center flex-wrap gap-4 lg:gap-6">
		<Button size="lg" icon="plus" animation="zoom" onclick={handleNewEvent}>
			{$dictionary.calendarSettings['New event']}
		</Button>
		{#if $settings.calendar.events.length >= 5}
			<Button size="lg" icon="trash" animation="rotate-clock-sm" onclick={handleDeleteAll}>
				{$dictionary.labels['Delete all']}
			</Button>
		{/if}
	</div>
</div>
