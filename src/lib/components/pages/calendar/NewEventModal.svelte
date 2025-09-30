<script lang="ts">
	import { onMount } from 'svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { addToast } from '$lib/components/ui/Toast.svelte';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import { dictionary } from '$lib/stores/languageDictionary';
	import { settings } from '$lib/stores/settings';
	import {
		type CalendarEvent,
		findNthWeekdayOccurrence,
		getEventDescription,
		isEventValid
	} from '$lib/util/eventManager';
	import { close, open } from '$lib/util/modal.svelte';
	import uid from '$lib/util/uid';
	import { getMonthNames, getWeekNames } from '$lib/util/getWeekMonthNames';
	import getTranslatedTimefield from '$lib/util/getTranslatedTimefield';
	import { deleteEvent } from '$lib/util/eventListActions';

	// TODO: should we store event data in standard date and time string formats so it's easier to handle here?
	// todo: limit user to 100 events

	// Event ID if editing an event, year month and day if creating a new event on a specific date (and maybe time), else no props
	interface Props {
		data?: {
			eventId?: string;
			year?: number;
			month?: number;
			day?: number;
			startTimeInMinutes?: number;
		};
	}

	let { data = $bindable({}) }: Props = $props();

	const isEditMode = $derived(!!data.eventId);

	const locale = $derived($settings.locale.language ?? 'en');
	const monthNames = $derived(getMonthNames(locale, 'long'));
	const weekdayNames = $derived(getWeekNames(locale, 'long'));
	const weekdayShortNames = $derived(getWeekNames(locale, 'short'));
	const confirmBeforeDeleting = $derived($settings.calendar.confirmBeforeDeleting);

	// Main event state object, which directly mirrors the CalendarEvent type
	let event: CalendarEvent = $state({
		title: '',
		originalDate: {
			year: data.year ?? new Date().getFullYear(),
			month: data.month ?? new Date().getMonth(),
			day: data.day ?? new Date().getDate()
		},
		startTimeInMinutes: data.startTimeInMinutes ?? undefined,
		endTimeInMinutes: undefined,
		id: data.eventId ?? uid() // If editing, use existing ID, otherwise create new one
	});

	// Utils for converting a date object or a time in minutes into strings that date and time inputs expect
	const dateObjToStr = (date: { year: number; month: number; day: number }) =>
		`${date.year}-${(date.month + 1).toString().padStart(2, '0')}-${date.day
			.toString()
			.padStart(2, '0')}`;
	const timeToStr = (startTimeInMinutes: number) =>
		`${Math.floor(startTimeInMinutes / 60)
			.toString()
			.padStart(2, '0')}:${(startTimeInMinutes % 60).toString().padStart(2, '0')}`;

	// Converts a `Date` into the YYYY-MM-DD string expected by date inputs
	const dateToInputString = (date: Date): string =>
		dateObjToStr({
			year: date.getUTCFullYear(),
			month: date.getUTCMonth(),
			day: date.getUTCDate()
		});

	// `dateInputString` must be initialized correctly here if given a creation date,
	// otherwise the `$effect` resets the `event.originalDate`
	// Use local time so the user's timezone is preserved
	const now = new Date();
	let dateInputString = $state(
		dateObjToStr(
			data.day && data.month && data.year
				? { year: data.year, month: data.month, day: data.day }
				: { year: now.getFullYear(), month: now.getMonth(), day: now.getDate() }
		)
	); // YYYY-MM-DD
	let timeInputString = $state(
		// Check explicitly for `undefined` instead of if truthy so it works if `startTimeInMinutes` is 0 (midnight)
		data.startTimeInMinutes !== undefined ? timeToStr(data.startTimeInMinutes) : ''
	); // HH:MM
	let endTimeInputString = $state('');

	let recurrenceEndType: 'never' | 'afterCount' | 'afterDate' = $state('never');
	let recurrenceEndDateString = $state('');

	// Helper to get a Date object from the date input string
	const getSelectedDate = () => {
		const [yearStr, monthStr, dayStr] = dateInputString.split('-').map(Number);
		if (isNaN(yearStr) || isNaN(monthStr) || isNaN(dayStr)) {
			return null;
		}
		// Use UTC to prevent timezone-related date shifts
		return new Date(Date.UTC(yearStr, monthStr - 1, dayStr));
	};

	// Helper function to get the current date's day number suffix (eg. "1st", "2nd", "3rd", "4th")
	function getDaySuffix(day: number): string {
		if (day > 3 && day < 21) return 'th';
		switch (day % 10) {
			case 1:
				return 'st';
			case 2:
				return 'nd';
			case 3:
				return 'rd';
			default:
				return 'th';
		}
	}

	// For selecting monthly or yearly recurrence types.
	type RecurrenceOptions = {
		dayOfMonth: string;
		nthWeekday: string;
		lastWeekday?: string;
	};

	// Derived state to get recurrence options for monthly and yearly based on the selected date.
	const monthlyRecurrenceOptions: RecurrenceOptions = $derived.by(() => {
		const selectedDate = getSelectedDate();
		if (!selectedDate) {
			return {
				dayOfMonth: $dictionary.calendarEvents['Day of the month'] as string,
				nthWeekday: $dictionary.calendarEvents['Nth weekday of the month'] as string,
				lastWeekday: undefined
			};
		}

		const dayOfMonth = selectedDate.getUTCDate();
		const dayOfWeek = weekdayNames[selectedDate.getUTCDay()];
		const { n, isLast } = findNthWeekdayOccurrence(selectedDate);
		const nthText = `${n}${getDaySuffix(n)}`;

		const result: RecurrenceOptions = {
			dayOfMonth: $dictionary.calendarEvents['Monthly on day'].replace(
				'{{day}}',
				String(dayOfMonth)
			),
			nthWeekday: $dictionary.calendarEvents['Monthly on the']
				.replace('{{nth}}', nthText)
				.replace('{{weekday}}', dayOfWeek)
		};

		if (isLast) {
			result.lastWeekday = $dictionary.calendarEvents['Monthly on the']
				.replace('{{nth}}', $dictionary.calendarEvents['Last'])
				.replace('{{weekday}}', dayOfWeek);
		}

		return result;
	});

	// Derived state for yearly recurrence options
	const yearlyRecurrenceOptions: RecurrenceOptions = $derived.by(() => {
		const selectedDate = getSelectedDate();
		if (!selectedDate) {
			return {
				dayOfMonth: $dictionary.calendarEvents['Day of the month'] as string,
				nthWeekday: $dictionary.calendarEvents['Nth weekday of the month'] as string,
				lastWeekday: undefined
			};
		}
		const monthOfYear = monthNames[selectedDate.getUTCMonth()];
		const dayOfMonth = selectedDate.getUTCDate();
		const dayOfWeek = weekdayNames[selectedDate.getUTCDay()];
		const { n, isLast } = findNthWeekdayOccurrence(selectedDate);
		const nthText = `${n}${getDaySuffix(n)}`;

		const result: RecurrenceOptions = {
			dayOfMonth: $dictionary.calendarEvents['Yearly on']
				.replace('{{month}}', monthOfYear)
				.replace('{{day}}', String(dayOfMonth)),
			nthWeekday: $dictionary.calendarEvents['Yearly on the']
				.replace('{{nth}}', nthText)
				.replace('{{weekday}}', dayOfWeek)
				.replace('{{month}}', monthOfYear)
		};

		if (isLast) {
			result.lastWeekday = $dictionary.calendarEvents['Yearly on the']
				.replace('{{nth}}', $dictionary.calendarEvents['Last'])
				.replace('{{weekday}}', dayOfWeek)
				.replace('{{month}}', monthOfYear);
		}

		return result;
	});

	// This effect syncs changes from the date input to the event object.
	// We no longer need the complex bidirectional sync. This one only updates the core date object.
	$effect(() => {
		const selectedDate = getSelectedDate();
		if (!selectedDate) return;
		event.originalDate = {
			year: selectedDate.getUTCFullYear(),
			month: selectedDate.getUTCMonth(),
			day: selectedDate.getUTCDate()
		};
	});

	// Effect to update event recurrence end based on recurrenceEndType state
	$effect(() => {
		if (!event.recurrence) return;

		if (recurrenceEndType === 'afterCount') {
			// Preserve user-defined count if present; default to 1 otherwise
			if (event.recurrence.end?.type !== 'count') {
				event.recurrence.end = { type: 'count', value: 1 };
			}
			recurrenceEndDateString = '';
		} else if (recurrenceEndType === 'afterDate') {
			// Preserve existing date when editing; otherwise start from today
			if (event.recurrence.end?.type !== 'until') {
				event.recurrence.end = { type: 'until', value: new Date() };
			}
			const end = event.recurrence.end.value;
			recurrenceEndDateString = end && !Number.isNaN(end.getTime()) ? dateToInputString(end) : '';
		} else {
			event.recurrence.end = undefined;
			recurrenceEndDateString = '';
		}
	});

	$effect(() => {
		if (event.recurrence?.end?.type !== 'until') return;
		const [y, m, d] = recurrenceEndDateString.split('-').map(Number);
		if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
			event.recurrence.end.value = new Date(Date.UTC(y, m - 1, d));
		} else {
			// store null so validation fails when date input is empty or invalid
			event.recurrence.end.value = null;
		}
	});
	// Function to update the recurrence object when frequency changes
	const updateRecurrence = () => {
		if (!event.recurrence) {
			return;
		}

		const selectedDate = getSelectedDate();
		if (!selectedDate) {
			return;
		}

		const selectedWeekday = selectedDate.getUTCDay();
		const interval = event.recurrence.interval || 1;
		const end = event.recurrence.end;

		switch (event.recurrence.frequency) {
			case 'daily':
				event.recurrence = { frequency: 'daily', interval, end };
				break;
			case 'weekly':
				event.recurrence = {
					frequency: 'weekly',
					interval,
					daysOfWeek: [selectedWeekday],
					end
				};
				break;
			case 'monthly':
				// Default to 'dayOfMonth' as the type, but do not store the day itself.
				// It will be derived from originalDate.
				event.recurrence = {
					frequency: 'monthly',
					interval,
					monthlyType: 'dayOfMonth',
					end
				};
				break;
			case 'yearly':
				// Default to 'dayOfMonth' as the type, but do not store the day/month itself.
				// It will be derived from originalDate.
				event.recurrence = {
					frequency: 'yearly',
					interval,
					yearlyType: 'dayOfMonth',
					end
				};
				break;
		}
	};

	// Load data if in edit mode
	onMount(() => {
		if (isEditMode) {
			const eventToEdit = $settings.calendar.events.find((e) => e.id === data.eventId);
			if (!eventToEdit) {
				addToast({ text: $dictionary.error['The resource could not be found'], icon: 'error' });
				close();
				return;
			}

			// Initialize recurrence end type before syncing the event object
			if (eventToEdit.recurrence?.end) {
				recurrenceEndType =
					eventToEdit.recurrence.end.type === 'count' ? 'afterCount' : 'afterDate';
			} else {
				recurrenceEndType = 'never';
			}

			event = JSON.parse(JSON.stringify(eventToEdit));
			dateInputString = dateObjToStr(eventToEdit.originalDate);
			if (eventToEdit.startTimeInMinutes !== undefined) {
				timeInputString = timeToStr(eventToEdit.startTimeInMinutes);
			}
			if (eventToEdit.endTimeInMinutes !== undefined) {
				endTimeInputString = timeToStr(eventToEdit.endTimeInMinutes);
			}
		}
	});

	const eventTimelineDescription = $derived(
		getEventDescription(
			event,
			$settings.calendar.ampm ?? undefined,
			$dictionary,
			$settings.locale.language ?? 'en'
		)
	);

	const isFormInvalid = $derived.by(() => {
		const selectedDate = getSelectedDate();
		if (selectedDate === null) return true;
		return !isEventValid(event);
	});

	const MAX_INTERVAL = 10000;
	const MAX_OCCURRENCES = 10000;
	const MAX_TITLE_LENGTH = 50;

	const handleSubmit = () => {
		if (isFormInvalid) {
			return;
		}

		// Trim title if too long
		if (event.title.length > MAX_TITLE_LENGTH) {
			event.title = event.title.slice(0, MAX_TITLE_LENGTH);
		}

		if (event.recurrence) {
			// Clamp interval between 1 and MAX_INTERVAL
			event.recurrence.interval = Math.floor(event.recurrence.interval);
			if (event.recurrence.interval < 1) event.recurrence.interval = 1;
			if (event.recurrence.interval > MAX_INTERVAL) event.recurrence.interval = MAX_INTERVAL;

			if (event.recurrence.end?.type === 'count') {
				event.recurrence.end.value = Math.floor(event.recurrence.end.value);
				if (event.recurrence.end.value < 1) event.recurrence.end.value = 1;
				if (event.recurrence.end.value > MAX_OCCURRENCES)
					event.recurrence.end.value = MAX_OCCURRENCES;
			}
		}

		if (isEditMode) {
			$settings.calendar.events = $settings.calendar.events.map((e) =>
				e.id === data.eventId ? { ...event } : e
			);
			addToast({ text: $dictionary.messages['Updated successfully'], icon: 'check' });
		} else {
			$settings.calendar.events.push({ ...event });
			$settings.calendar.events = $settings.calendar.events; // Trigger reactivity
			addToast({ text: $dictionary.messages['Created successfully'], icon: 'check' });
		}
		close();
	};

	/** Prompt the user before deleting the current event. */
	function handleDelete() {
		if (!confirmBeforeDeleting) {
			$settings.calendar.events = deleteEvent($dictionary, $settings.calendar.events, event.id);
			close();
			return;
		}

		open('confirm-modal', {
			message: $dictionary.messages['Delete item?'],
			confirmText: $dictionary.labels['Delete'],
			cancelText: $dictionary.labels['Close'],
			confirmIcon: 'trash',
			onConfirm: () => {
				$settings.calendar.events = deleteEvent($dictionary, $settings.calendar.events, event.id);
				close();
			}
		});
	}

	function toggleDayOfWeek(day: number) {
		if (event.recurrence?.frequency !== 'weekly') return;

		const isSelected = event.recurrence.daysOfWeek.includes(day);
		event.recurrence.daysOfWeek = isSelected
			? event.recurrence.daysOfWeek.filter((d) => d !== day)
			: [...event.recurrence.daysOfWeek, day];
	}

	function onRepeatChange(checked: boolean) {
		if (checked) {
			const selectedDate = getSelectedDate();
			if (selectedDate) {
				event.recurrence = { frequency: 'daily', interval: 1, end: undefined };
				updateRecurrence();
			}
		} else {
			event.recurrence = undefined;
		}
	}

	// We do this here instead of on submit because we want to always check if the form is valid
	$effect(() => {
		// Parse timeInputString to event.startTimeInMinutes
		if (timeInputString) {
			const [h, m] = timeInputString.split(':').map(Number);
			if (!isNaN(h) && !isNaN(m)) {
				event.startTimeInMinutes = h * 60 + m;
			}
		} else {
			event.startTimeInMinutes = undefined;
		}
		// Parse endTimeInputString to event.endTimeInMinutes
		if (endTimeInputString) {
			const [h, m] = endTimeInputString.split(':').map(Number);
			if (!isNaN(h) && !isNaN(m)) {
				event.endTimeInMinutes = h * 60 + m;
			}
		} else {
			event.endTimeInMinutes = undefined;
		}
	});
</script>

<div class="pad">
	<div class="mb-4">
		<label for="title" class="label">{$dictionary.pomodoroSettings['Name:']}</label>
		<input
			bind:value={event.title}
			type="text"
			id="title"
			class="w-full"
			placeholder={$dictionary.labels['Untitled']}
			maxlength="50" />
	</div>

	<div class="mb-4">
		<label for="date" class="label">{$dictionary.labels['Date']}</label>
		<input bind:value={dateInputString} type="date" id="date" class="w-full" />
	</div>

	<div class="mb-4">
		<label for="time" class="label">{$dictionary.calendarEvents['Start Time (optional)']}</label>
		<input bind:value={timeInputString} type="time" id="time" class="w-full" />
	</div>
	{#if timeInputString !== ''}
		<div class="mb-4">
			<label for="endTime" class="label">{$dictionary.calendarEvents['End Time (optional)']}</label>
			<input bind:value={endTimeInputString} type="time" id="endTime" class="w-full" />
		</div>
	{/if}

	<div class="mb-4">
		<Toggle
			id="repeat"
			checked={!!event.recurrence}
			onchange={onRepeatChange}
			labelText={$dictionary.calendarEvents['Repeat']} />
	</div>

	{#if event.recurrence}
		<div class="mb-4 flex items-center gap-2">
			<span>{$dictionary.calendarEvents['Every']}</span>
			<input
				bind:value={event.recurrence.interval}
				type="number"
				id="interval"
				class="w-16"
				min="1"
				max="10000"
				step="1" />

			<select
				bind:value={event.recurrence.frequency}
				onchange={updateRecurrence}
				id="recurrenceType"
				class="flex-grow">
				<option value="daily">
					{getTranslatedTimefield(locale, 'day', event.recurrence.interval > 1)}
				</option>
				<option value="weekly">
					{getTranslatedTimefield(locale, 'week', event.recurrence.interval > 1)}
				</option>
				<option value="monthly">
					{getTranslatedTimefield(locale, 'month', event.recurrence.interval > 1)}
				</option>
				<option value="yearly">
					{getTranslatedTimefield(locale, 'year', event.recurrence.interval > 1)}
				</option>
			</select>
		</div>

		{#if event.recurrence.frequency === 'weekly' && event.recurrence.daysOfWeek}
			<div class="mb-4">
				<p class="label">{$dictionary.calendarEvents['Days of the Week']}</p>
				<div class="flex flex-wrap gap-2">
					{#each [0, 1, 2, 3, 4, 5, 6] as day}
						{@const pressed = event.recurrence.daysOfWeek.includes(day)}
						<Button
							variant="outline"
							aria-pressed={pressed}
							onclick={() => toggleDayOfWeek(day)}
							className="px-10 grow {pressed
								? 'bg-accent-700 text-base-50 hover:bg-accent-700'
								: ''}">
							{weekdayShortNames[day]}
						</Button>
					{/each}
				</div>
			</div>
		{/if}

		{#if event.recurrence.frequency === 'monthly'}
			<div class="mb-4">
				<label for="monthlyType" class="label"
					>{$dictionary.calendarEvents['Monthly Recurrence By']}</label>
				<select bind:value={event.recurrence.monthlyType} id="monthlyType" class="w-full">
					<option value="dayOfMonth">{monthlyRecurrenceOptions.dayOfMonth}</option>
					<option value="nthWeekday">{monthlyRecurrenceOptions.nthWeekday}</option>
					{#if monthlyRecurrenceOptions.lastWeekday}
						<option value="lastWeekday">
							{monthlyRecurrenceOptions.lastWeekday}
						</option>
					{/if}
				</select>
			</div>
		{/if}

		{#if event.recurrence.frequency === 'yearly'}
			<div class="mb-4">
				<label for="yearlyType" class="label"
					>{$dictionary.calendarEvents['Yearly Recurrence By']}</label>
				<select bind:value={event.recurrence.yearlyType} id="yearlyType" class="w-full">
					<option value="dayOfMonth">{yearlyRecurrenceOptions.dayOfMonth}</option>
					<option value="nthWeekday">{yearlyRecurrenceOptions.nthWeekday}</option>
					{#if yearlyRecurrenceOptions.lastWeekday}
						<option value="lastWeekday">
							{yearlyRecurrenceOptions.lastWeekday}
						</option>
					{/if}
				</select>
			</div>
		{/if}

		<div class="mb-4">
			<label for="recurrenceEndType" class="label">{$dictionary.calendarEvents['Ends']}</label>
			<select bind:value={recurrenceEndType} id="recurrenceEndType" class="w-full">
				<option value="never">{$dictionary.calendarEvents['Never']}</option>
				<option value="afterCount"
					>{$dictionary.calendarEvents['After number of occurrences']}</option>
				<option value="afterDate">{$dictionary.calendarEvents['On a specific date']}</option>
			</select>
		</div>

		{#if event.recurrence.end?.type === 'count'}
			<div class="mb-4">
				<label for="recurrenceEndCount" class="label"
					>{$dictionary.calendarEvents['Occurrences']}</label>
				<input
					bind:value={event.recurrence.end.value}
					type="number"
					id="recurrenceEndCount"
					class="w-full"
					min="1"
					max="10000"
					step="1" />
			</div>
		{:else if event.recurrence.end?.type === 'until'}
			<div class="mb-4">
				<label for="recurrenceEndDate" class="label"
					>{$dictionary.calendarEvents['End Date']}</label>
				<input
					bind:value={recurrenceEndDateString}
					type="date"
					id="recurrenceEndDate"
					class="w-full" />
			</div>
		{/if}
	{/if}

	<div class="flex flex-wrap justify-between items-start mt-6">
		<p class="p-sm mr-4">
			{eventTimelineDescription}
		</p>
		<div class="flex-grow flex justify-end gap-2">
			{#if isEditMode}
				<Button animation="rotate-clock-sm" icon="trash" onclick={handleDelete}>
					{$dictionary.labels['Delete']}
				</Button>
				<Button animation="move-left" icon="undo" onclick={close}>
					{$dictionary.calendarEvents['Discard changes']}
				</Button>
			{/if}
			<Button
				animation="zoom"
				icon={isEditMode ? 'check' : 'plus'}
				onclick={handleSubmit}
				disabled={isFormInvalid}>
				{$dictionary.labels[isEditMode ? 'Save' : 'Create']}
			</Button>
		</div>
	</div>
</div>
