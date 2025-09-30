<script module lang="ts">
	import { addToast } from '$lib/components/ui/Toast.svelte';
	import { copyURL } from '$lib/util/copy';
	import toggleFullscreen from '$lib/util/toggleFullscreen';

	export function openWindow(url: string | URL, width = 400, height = 400, left = 20, top = 20) {
		// https://www.w3schools.com/jsref/met_win_open.asp
		const win = window.open(
			url,
			'_blank',
			`width=${width},height=${height},left=${left},top=${top},titlebar=no,toolbar=no,menubar=no,location=no,status=no`
		);
		win?.focus();
	}

	let wakeLock: WakeLockSentinel | null;

	// https://developer.mozilla.org/en-US/docs/Web/API/WakeLock/request
	export async function requestWakeLock(languageDictionary: any) {
		if (!('wakeLock' in navigator)) {
			console.log('WakeLock is not supported in this browser.');
			return;
		}
		let success = true;
		try {
			wakeLock = await (navigator.wakeLock as any).request('screen');
			wakeLock?.addEventListener('release', () => {
				console.log('wakeLock was released');
			});
			console.log('wakeLock success');
		} catch (err) {
			// The wake lock request fails - usually system-related, such as low battery.
			if (typeof err === 'object' && err !== null && 'name' in err && 'message' in err) {
				console.log(`Error creating wakeLock: ${err.name}, ${err.message}`);
			} else {
				console.log(`Error creating wakeLock: ${err}`);
			}
			success = false;
		}

		const text = success
			? languageDictionary.messages['Wake lock was activated successfully']
			: languageDictionary.messages['Wake lock failure'];
		const icon = success ? 'success' : 'error';
		addToast({ text, icon });
	}

	// https://phpnews.io/feeditem/have-a-web-page-prevent-your-screen-computer-from-dimming-sleeping-with-the-wake-lock-api
	async function releaseWakeLock(languageDictionary: any) {
		let success = true;
		if (!wakeLock) return;
		try {
			await wakeLock.release();
			wakeLock = null;
		} catch (err) {
			if (typeof err === 'object' && err !== null && 'name' in err && 'message' in err) {
				console.log(`Error releasing wakeLock: ${err.name}, ${err.message}`);
			} else {
				console.log(`Error releasing wakeLock: ${err}`);
			}
			success = false;
		}

		const text = success
			? languageDictionary.messages['Wake lock was deactivated successfully']
			: languageDictionary.messages['Wake lock failure'];
		const icon = success ? 'success' : 'error';
		addToast({ text, icon });
	}
</script>

<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import dayjs from 'dayjs';
	import { WebviewWindow } from '@tauri-apps/api/webviewWindow';

	import SettingSelect from '$lib/components/features/settings/SettingSelect.svelte';
	import Accordion from '$lib/components/ui/Accordion.svelte';
	import AccordionPanel from '$lib/components/ui/AccordionPanel.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import TimezoneAutocomplete from '$lib/components/features/misc/TimezoneAutocomplete.svelte';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import { locales, supportedLangs } from '$lib/data/consts';
	import { dictionary } from '$lib/stores/languageDictionary';
	import { defaultSettings, settings } from '$lib/stores/settings';
	import { defaultNightTheme } from '$lib/themes';
	import { castClock, isCastSupported } from '$lib/util/cast';
	import deleteDataAndReload from '$lib/util/deleteDataAndReload';
	import { installButtonClick, showInstallButton } from '$lib/util/install.svelte';
	import isTauri from '$lib/util/isTauri';
	import { open } from '$lib/util/modal.svelte';
	import { now } from '$lib/util/now.svelte';
	import shareApp from '$lib/util/shareApp';
	import uid from '$lib/util/uid';

	const castSupported = browser && isCastSupported(window);

	let hoveringContact = $state(false);

	// Save user's non-setting data like worldclocks and timers
	function resetAllSettings() {
		// Note: we save user's chess time control settings because we save the timer
		// If we didn't, then the time control would be reset for the current active timer
		const userCustomClockText = JSON.parse(JSON.stringify($settings.clock.displays.text));
		const userWorldclocks = JSON.parse(JSON.stringify($settings.worldclock.timezones));
		const userStopwatches = JSON.parse(JSON.stringify($settings.stopwatch.stopwatches));
		const userPomodoros = JSON.parse(JSON.stringify($settings.pomodoro.timer));
		const userChessclock = JSON.parse(JSON.stringify($settings.chessclock.timer));
		const userChessclockTimeControl = JSON.parse(JSON.stringify($settings.chessclock.timeControl));
		const userLocation = JSON.parse(JSON.stringify($settings.sunrise.location));
		const userRubiksTimer = JSON.parse(JSON.stringify($settings.rubiks.timer));
		const userRubiksSessions = JSON.parse(JSON.stringify($settings.rubiks.sessions));
		const userRubiksSessionID = JSON.parse(JSON.stringify($settings.rubiks.currentSessionID));
		const userRubiksScramble = JSON.parse(JSON.stringify($settings.rubiks.scramble));
		const userTimers = JSON.parse(JSON.stringify($settings.timer.timers));
		const userCountdowns = JSON.parse(JSON.stringify($settings.countdown.countdowns));
		const userBirthdays = JSON.parse(JSON.stringify($settings.birthdays.birthdays));
		const userEvents = JSON.parse(JSON.stringify($settings.calendar.events));

		$settings = JSON.parse(JSON.stringify(defaultSettings));

		// Restore user's non-setting data
		$settings.clock.displays.text = userCustomClockText;
		$settings.worldclock.timezones = userWorldclocks;
		$settings.stopwatch.stopwatches = userStopwatches;
		$settings.pomodoro.timer = userPomodoros;
		$settings.chessclock.timer = userChessclock;
		$settings.chessclock.timeControl = userChessclockTimeControl;
		$settings.sunrise.location = userLocation;
		$settings.rubiks.timer = userRubiksTimer;
		$settings.rubiks.sessions = userRubiksSessions;
		$settings.rubiks.currentSessionID = userRubiksSessionID;
		$settings.rubiks.scramble = userRubiksScramble;
		$settings.timer.timers = userTimers;
		$settings.countdown.countdowns = userCountdowns;
		$settings.birthdays.birthdays = userBirthdays;
		$settings.calendar.events = userEvents;

		// Auto detect user device preferences (same code as in layout)
		$settings.darkMode = !!window.matchMedia('(prefers-color-scheme: dark)').matches;
		if ($settings.darkMode) {
			$settings.clock.themeID = defaultNightTheme.id;
			$settings.worldclock.themeID = defaultNightTheme.id;
		}
		$settings.locale.language =
			Intl.DateTimeFormat().resolvedOptions().locale.substring(0, 2) ?? 'en';
		$settings.locale.datetime =
			Intl.DateTimeFormat().resolvedOptions().locale.substring(0, 2) ?? 'en';
		$settings.locale.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'Etc/GMT';
		$settings.sunrise.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'Etc/GMT';

		if ($settings.locale.metric === null) {
			$settings.locale.metric = !navigator.language.endsWith('US');
		}

		// https://stackoverflow.com/q/27647918/4907950
		const AMPM =
			Intl.DateTimeFormat(navigator.language, { hour: 'numeric' }).resolvedOptions().hourCycle ===
			'h12';
		$settings.clock.timeFormat = AMPM ? 'h:mm A' : 'H:mm';
		$settings.clock.timeFormatCustom = AMPM ? 'h:mm A' : 'H:mm';
		$settings.worldclock.timeFormat = AMPM ? 'h:mm A' : 'H:mm';
		$settings.worldclock.timeFormatCustom = AMPM ? 'h:mm A' : 'H:mm';
	}

	async function openTauriWindow() {
		new WebviewWindow(`desktopclock-${uid()}`, {
			url: 'index.html',
			title: $dictionary.appName
		});
	}
</script>

<Accordion key="1">
	<AccordionPanel accordionTitle={$dictionary.labels['Application']} key="1">
		<div class="flex flex-wrap gap-4 lg:gap-6">
			{#if browser && navigator.share !== undefined}
				<Button
					icon="share"
					animation="flip-rotate"
					onclick={() => shareApp($dictionary, page.url.pathname)}>
					{$dictionary.labels['Share']}
				</Button>
			{/if}

			<Button icon="link" animation="rotate-clock" onclick={() => copyURL($dictionary)}>
				{$dictionary.labels['Copy website link']}
			</Button>

			{#if castSupported && !isTauri()}
				<Button icon="cast" animation="flip-horizontal" onclick={castClock}>
					{$dictionary.labels['Cast']}
				</Button>
			{/if}

			<Button icon="fullscreen" animation="flip-horizontal" onclick={toggleFullscreen}>
				{$dictionary.labels['Fullscreen']}
			</Button>

			{#if showInstallButton.value}
				<Button icon="download" animation="move-down" onclick={installButtonClick}>
					{$dictionary.labels['Install']}
				</Button>
			{/if}

			<Button
				icon="external_link"
				animation="rotate-counter"
				onclick={() => (isTauri() ? openTauriWindow() : openWindow(window.location.href))}>
				{$dictionary.labels['Open another clock']}
			</Button>

			<Button
				onmouseover={() => (hoveringContact = true)}
				onfocus={() => (hoveringContact = true)}
				onmouseout={() => (hoveringContact = false)}
				onblur={() => (hoveringContact = false)}
				onclick={() =>
					// using English for email subject
					// English name is generally what the app is known for, also makes it easier for me to know what an email is about
					// this function is defined on page load anyway, making this a more difficult problem than is worth the time
					window.open(
						'mailto:contact@justingolden.me?subject=' + encodeURIComponent('Desktop Clock')
					)}>
				<Icon
					name={hoveringContact ? 'envelope_open' : 'envelope'}
					className="transition-transform {hoveringContact ? 'translate-y-[-2px]' : ''}" />
				{$dictionary.labels['Send feedback']}
			</Button>

			<Button icon="undo" animation="move-left" onclick={resetAllSettings}>
				{$dictionary.labels['Reset all settings']}
			</Button>
		</div>

		<h3 class="h4 mt-6 mb-2">{$dictionary.labels['Advanced / Experimental']}</h3>

		<div class="block mb-2">
			<Toggle
				id="wakelock-toggle"
				labelText={$dictionary.labels['Keep screen awake']}
				checked={$settings.wakeLock}
				onchange={(checked) => {
					$settings.wakeLock = checked;
					if ($settings.wakeLock) {
						requestWakeLock($dictionary);
					} else {
						releaseWakeLock($dictionary);
					}
				}} />
		</div>
		<Button icon="trash" animation="rotate-clock-sm" onclick={deleteDataAndReload}>
			{$dictionary.labels['Delete all data and reload']}
		</Button>

		<!-- TODO maybe: buttons for download and upload settings, multiple clock settings, quick resize window -->
	</AccordionPanel>
	<AccordionPanel accordionTitle={$dictionary.labels['Shortcuts']} key="2">
		<div>
			<Toggle
				id="dbl-click-fullscreen-toggle"
				labelText={$dictionary.labels['Doubleclick fullscreen']}
				bind:checked={$settings.doubleclickFullscreen} />
		</div>
		<div>
			<Toggle
				id="keyboard-shortcuts-toggle"
				labelText={$dictionary.labels['Keyboard shortcuts']}
				bind:checked={$settings.keyboardShortcuts} />
		</div>
		<Button icon="table" className="mt-4" onclick={() => open('keyboard-shortcuts')}>
			{$dictionary.labels['View keyboard shortcuts']}
		</Button>
	</AccordionPanel>
	<AccordionPanel accordionTitle={$dictionary.labels['Locale']} key="3">
		<div class="mb-4">
			<SettingSelect
				id="language-select"
				selectLabel={$dictionary.labels['Language:']}
				disabled={$settings.locale.automaticLanguage}
				value={$settings.locale.language ?? 'en'}
				onchange={(e) => {
					$settings.locale.language = e.currentTarget.value;

					// change locale when changing language
					// @ts-ignore: includes can handle values not in array
					if (locales.includes(e.currentTarget.value)) {
						$settings.locale.automaticDatetime = false;
						$settings.locale.datetime = e.currentTarget.value;
					}
					$settings = $settings;
				}}
				values={supportedLangs}
				labels={$dictionary.languages} />

			<Toggle
				id="auto-detect-language-toggle"
				labelText={$dictionary.labels['Automatically detect language']}
				bind:checked={$settings.locale.automaticLanguage}
				onchange={(checked) => {
					if (checked) {
						// same code as layout, reset to user device default
						$settings.locale.language = Intl.DateTimeFormat()
							.resolvedOptions()
							.locale.substring(0, 2);
					}
				}} />
		</div>
		<div class="mb-4">
			<SettingSelect
				id="datetime-locale-select"
				selectLabel={$dictionary.labels['Datetime locale:']}
				disabled={$settings.locale.automaticDatetime}
				bind:value={$settings.locale.datetime}
				values={locales} />

			<Toggle
				id="auto-detect-datetime-locale-toggle"
				labelText={$dictionary.labels['Automatically detect datetime locale']}
				bind:checked={$settings.locale.automaticDatetime}
				onchange={(checked) => {
					if (checked) {
						// same code as layout, reset to user device default
						$settings.locale.datetime = Intl.DateTimeFormat()
							.resolvedOptions()
							.locale.substring(0, 2);
					}
				}} />
		</div>
		<!-- TODO options should look something like "Pacific Daylight Time (GMT-7) Los Angeles, CA" -->
		{#if $settings.locale.automaticTimezone}
			<p class="p">
				{$dictionary.labels['Timezone:']}
				{$settings.locale.timezone?.replace(/_/g, ' ')}
			</p>
		{:else if $settings.locale.timezone !== null}
			<TimezoneAutocomplete labelID="user-timezone-input" bind:value={$settings.locale.timezone} />
		{/if}
		<p class="p-sm mt-2">
			{$dictionary.labels['Timezone offset:']}
			{dayjs(now.value)
				.tz($settings.locale.timezone ?? undefined)
				.utcOffset() / 60}
		</p>
		<Toggle
			id="auto-detect-timezone-toggle"
			labelText={$dictionary.labels['Automatically detect timezone']}
			bind:checked={$settings.locale.automaticTimezone}
			onchange={(checked) => {
				if (checked) {
					// same code as layout, reset to user device default
					$settings.locale.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
				}
			}} />

		<!-- TODO: btn to reset all locale settings, onclick toggles all auto to on which resets others -->
	</AccordionPanel>
</Accordion>
