<script lang="ts">
	/**
	 * Inputs for a new timer or countdown as well as a name input and start button
	 */

	import KeypadInput from '$lib/components/pages/timer/KeypadInput.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import TimezoneAutocomplete from '$lib/components/features/misc/TimezoneAutocomplete.svelte';
	import { addToast } from '$lib/components/ui/Toast.svelte';
	import { dictionary } from '$lib/stores/languageDictionary';
	import { settings } from '$lib/stores/settings';
	import getSecondsUntil from '$lib/util/getSecondsUntil';
	import { now } from '$lib/util/now.svelte';
	import uid from '$lib/util/uid';
	import validateInt from '$lib/util/validateInt';
	import getTranslatedTimefield from '$lib/util/getTranslatedTimefield';

	let day = $state(0),
		hour = $state(0),
		min = $state(0),
		sec = $state(0);

	const locale = $derived($settings.locale.language ?? 'en');

	// currently selected date and time, default to today and no selected time
	let time = $state('');
	// date in yyyy-mm-dd format, today's date in current timezone
	const today = new Date();
	let date = $state(
		`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
			today.getDate()
		).padStart(2, '0')}`
	);
	let timezone = $state($settings.locale.timezone ?? 'Etc/GMT');

	let name = $state('');

	interface Props {
		currentTab?: 'timer' | 'countdown';
	}

	const { currentTab = 'timer' }: Props = $props();

	// check `$now` in countdown mode so if the time changes and the selected time is no longer in the future
	// then the button reacts and becomes disabled
	const btnDisabled = $derived(
		currentTab === 'timer'
			? day === 0 && hour === 0 && min === 0 && sec === 0
			: time === '' ||
					date === '' ||
					getSecondsUntil(date, time, $settings.countdown.timezoneInput ? timezone : undefined) <=
						0 ||
					now.value === undefined
	);

	function newTimer() {
		if (currentTab === 'timer') {
			if ($settings.timer.timers.length >= 50) {
				const text = $dictionary.messages['Too many timers'];
				const icon = 'error';
				addToast({ text, icon });
				return;
			}

			// We check for `$settings.timer.daysInput` so if the input was shown and entered
			// and is now hidden that the value doesn't get used
			$settings.timer.timers.push({
				type: 'timer',
				id: uid(),
				name,
				duration:
					($settings.timer.daysInput ? day * 24 * 60 * 60 : 0) + hour * 60 * 60 + min * 60 + sec,
				running: true,
				start: Date.now(),
				pausedSince: 0,
				played: false
			});
			$settings.timer.timers = $settings.timer.timers;
		} else {
			if ($settings.countdown.countdowns.length >= 50) {
				const text = $dictionary.messages['Too many countdowns'];
				const icon = 'error';
				addToast({ text, icon });
				return;
			}

			$settings.countdown.countdowns.push({
				type: 'countdown',
				id: uid(),
				name,
				date,
				time,
				timezone: $settings.countdown.timezoneInput ? timezone : undefined,
				played: false
			});
			$settings.countdown.countdowns = $settings.countdown.countdowns;
		}
	}

	function handleKeypadStart(name: string, totalSeconds: number) {
		if ($settings.timer.timers.length >= 50) {
			const text = $dictionary.messages['Too many timers'];
			const icon = 'error';
			addToast({ text, icon });
			return;
		}

		$settings.timer.timers.push({
			type: 'timer',
			id: uid(),
			name: name,
			duration: totalSeconds,
			running: true,
			start: Date.now(),
			pausedSince: 0,
			played: false
		});
		$settings.timer.timers = $settings.timer.timers;
	}
</script>

{#if currentTab === 'timer'}
	{#if $settings.timer.input === 'keypad'}
		<div class="mb-10 mx-auto w-fit">
			<KeypadInput {handleKeypadStart} />
		</div>
	{:else}
		<div class="grid grid-flow-col grid-rows-2 gap-4 lg:gap-6 gap-y-2">
			{#if $settings.timer.daysInput}
				<input
					id="days-input"
					class="max-w-[8rem]"
					type="number"
					min="0"
					max="9999"
					oninput={(event) => {
						event.preventDefault();
						const value = validateInt(event.currentTarget, 0);
						day = value;
						event.currentTarget.value = String(value);
					}}
					value={day} />
				<label for="days-input" class="label">
					{getTranslatedTimefield(locale, 'day', true, true)}
				</label>
			{/if}
			<input
				id="hours-input"
				class="max-w-[8rem]"
				type="number"
				min="0"
				max={$settings.timer.daysInput ? '23' : '9999'}
				oninput={(event) => {
					event.preventDefault();
					const value = validateInt(event.currentTarget, 0);
					hour = value;
					event.currentTarget.value = String(value);
				}}
				value={hour} />
			<label for="hours-input" class="label"
				>{getTranslatedTimefield(locale, 'hour', true, true)}</label>
			<input
				id="minutes-input"
				class="max-w-[8rem]"
				type="number"
				min="0"
				max="59"
				oninput={(event) => {
					event.preventDefault();
					const value = validateInt(event.currentTarget, 0);
					min = value;
					event.currentTarget.value = String(value);
				}}
				value={min} />
			<label for="minutes-input" class="label"
				>{getTranslatedTimefield(locale, 'minute', true, true)}</label>
			<input
				id="seconds-input"
				class="max-w-[8rem]"
				type="number"
				min="0"
				max="59"
				oninput={(event) => {
					event.preventDefault();
					const value = validateInt(event.currentTarget, 0);
					sec = value;
					event.currentTarget.value = String(value);
				}}
				value={sec} />
			<label for="seconds-input" class="label"
				>{getTranslatedTimefield(locale, 'second', true, true)}</label>
		</div>
	{/if}
{:else}
	<div class="grid grid-flow-col grid-rows-2 gap-4 lg:gap-6 gap-y-2">
		<input id="date-input" class="grow max-w-[16rem]" type="date" bind:value={date} />
		<label for="date-input" class="label">{$dictionary.labels['Date']}</label>
		<input id="time-input" class="grow max-w-[16rem]" type="time" bind:value={time} />
		<label for="time-input" class="label">{$dictionary.labels['Time']}</label>
	</div>

	{#if $settings.countdown.timezoneInput}
		<TimezoneAutocomplete bind:value={timezone} />
	{/if}
{/if}

{#if !(currentTab === 'timer' && $settings.timer.input === 'keypad')}
	<div class="mt-4 mb-10 flex flex-wrap items-end justify-center gap-4 lg:gap-6">
		<div>
			<label class="label mr-2" for="name-input">{$dictionary.labels['Name']}</label>
			<input id="name-input" maxlength="50" type="text" bind:value={name} />
		</div>

		<Button disabled={btnDisabled} onclick={newTimer} icon="play" animation="zoom">
			{$dictionary.stopwatchSettings['Start']}
		</Button>
	</div>
{/if}
