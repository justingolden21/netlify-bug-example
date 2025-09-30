<script lang="ts">
	// parent settings modal component - has panels for current page settings, appearance, general and about
	import { page } from '$app/state';
	import { onMount } from 'svelte';

	import SettingsPanelAbout from '$lib/components/features/settings/SettingsPanelAbout.svelte';
	import SettingsPanelAppearance from '$lib/components/features/settings/SettingsPanelAppearance.svelte';
	import SettingsPanelGeneral from '$lib/components/features/settings/SettingsPanelGeneral.svelte';
	import BirthdaysSettings from '$lib/components/pages/birthdays/BirthdaysSettings.svelte';
	import CalendarSettings from '$lib/components/pages/calendar/CalendarSettings.svelte';
	import ChessclockSettings from '$lib/components/pages/chessclock/ChessclockSettings.svelte';
	import ClockSettings from '$lib/components/pages/clock/ClockSettings.svelte';
	import CountdownSettings from '$lib/components/pages/countdown/CountdownSettings.svelte';
	import PictureinpictureSettings from '$lib/components/pages/pictureinpicture/PictureinpictureSettings.svelte';
	import PomodoroSettings from '$lib/components/pages/pomodoro/PomodoroSettings.svelte';
	import RubiksSettings from '$lib/components/pages/rubiks/RubiksSettings.svelte';
	import StopwatchSettings from '$lib/components/pages/stopwatch/StopwatchSettings.svelte';
	import SunriseSettings from '$lib/components/pages/sunrise/SunriseSettings.svelte';
	import TimerSettings from '$lib/components/pages/timer/TimerSettings.svelte';
	import TimestampSettings from '$lib/components/pages/timestamp/TimestampSettings.svelte';
	import WeatherSettings from '$lib/components/pages/weather/WeatherSettings.svelte';
	import WorldclockSettings from '$lib/components/pages/worldclock/WorldclockSettings.svelte';
	import Tabs, { type Tab } from '$lib/components/ui/Tabs.svelte';
	import { appPages, fontFamilies } from '$lib/data/consts';
	import { dictionary } from '$lib/stores/languageDictionary';
	import { setupCasting } from '$lib/util/cast';

	onMount(setupCasting);

	function getPageTabName() {
		switch (page.url.pathname) {
			case '/':
				return 'clock';
			case '/worldclock':
				return 'worldclock';
			case '/stopwatch':
				return 'stopwatch';
			case '/pomodoro':
				return 'pomodoro';
			case '/chessclock':
				return 'chessclock';
			case '/sunrisesunset':
				return 'sunrisesunset';
			case '/rubikscube':
				return 'rubikscube';
			case '/calendar':
				return 'calendar';
			case '/weather':
				return 'weather';
			case '/pictureinpicture':
				return 'pictureinpicture';
			case '/timer':
				return 'timer';
			case '/countdown':
				return 'countdown';
			case '/timestamp':
				return 'timestamp';
			case '/birthdays':
				return 'birthdays';
			default:
				throw new Error(`Page not found: ${page.url.pathname}`);
		}
	}

	function getPageTabComponent() {
		switch (page.url.pathname) {
			case '/':
				return ClockSettings;
			case '/worldclock':
				return WorldclockSettings;
			case '/stopwatch':
				return StopwatchSettings;
			case '/pomodoro':
				return PomodoroSettings;
			case '/chessclock':
				return ChessclockSettings;
			case '/sunrisesunset':
				return SunriseSettings;
			case '/rubikscube':
				return RubiksSettings;
			case '/calendar':
				return CalendarSettings;
			case '/weather':
				return WeatherSettings;
			case '/pictureinpicture':
				return PictureinpictureSettings;
			case '/timer':
				return TimerSettings;
			case '/countdown':
				return CountdownSettings;
			case '/timestamp':
				return TimestampSettings;
			case '/birthdays':
				return BirthdaysSettings;
		}
	}

	let tabData = $state([] as Tab[]);
	function getTabData() {
		const settingsTabData = [
			{
				name: $dictionary.settingsTabs['Appearance'],
				content: SettingsPanelAppearance,
				icon: 'eye'
			},
			{
				name: $dictionary.settingsTabs['General'],
				content: SettingsPanelGeneral,
				icon: 'application'
			},
			{
				name: $dictionary.settingsTabs['About'],
				content: SettingsPanelAbout,
				icon: 'info'
			}
		] as Tab[];

		if (appPages.includes(page.url.pathname)) {
			settingsTabData.unshift({
				name: $dictionary.pageNames[getPageTabName()],
				content: getPageTabComponent(),
				icon: getPageTabName()
			});
		}

		tabData = settingsTabData;
	}
	$effect(() => {
		if ($dictionary) getTabData();
	});
</script>

<!-- dirty trick to cache fonts when opening settings (for PWA) -->
{#each Object.keys(fontFamilies) as fontFamily}
	<span class="w-0 h-0" style:font-family={fontFamily}></span>
{/each}

<Tabs tabs={tabData} />
