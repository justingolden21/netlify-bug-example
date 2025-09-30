/**
 * Stores all modal data and is consumed by `ModalManager.svelte`
 *
 * To add a new modal:
 * - Import the component
 * - Add component to `modalData` with its icon and title
 * - Optionally, add a size (small or medium, default is small)
 *
 * Titles use language dictionary keys, eg. `['labels', 'Settings']`
 * Modals default to small size, and can optiaonlly be made medium
 *
 * Only larger displays like settings, views with lots of data, or editing analog themes
 * for example should be made medium.
 */

import AnalogClockThemeEditModal from '$lib/components/features/analog/AnalogClockThemeEditModal.svelte';
import KeyboardShortcutsModal from '$lib/components/features/settings/KeyboardShortcutsModal.svelte';
import Settings from '$lib/components/features/settings/Settings.svelte';
import AddBirthdayModal from '$lib/components/pages/birthdays/AddBirthdayModal.svelte';
import EventsListModal from '$lib/components/pages/calendar/EventsListModal.svelte';
import NewEventModal from '$lib/components/pages/calendar/NewEventModal.svelte';
import ChessclockSettings from '$lib/components/pages/chessclock/ChessclockSettings.svelte';
import DatetimeFormatModal from '$lib/components/pages/clock/DatetimeFormatModal.svelte';
import AboutPomodoro from '$lib/components/pages/pomodoro/AboutPomodoro.svelte';
import NewPomodoro from '$lib/components/pages/pomodoro/NewPomodoro.svelte';
import PomodoroSettings from '$lib/components/pages/pomodoro/PomodoroSettings.svelte';
import RubiksInteractableCubeModal from '$lib/components/pages/rubiks/RubiksInteractableCubeModal.svelte';
import RubiksScrambleGuideModal from '$lib/components/pages/rubiks/RubiksScrambleGuideModal.svelte';
import RubiksScrambleWalkthroughModal from '$lib/components/pages/rubiks/RubiksScrambleWalkthroughModal.svelte';
import RubiksSessionsModal from '$lib/components/pages/rubiks/RubiksSessionsModal.svelte';
import RubiksSingleSessionModal from '$lib/components/pages/rubiks/RubiksSingleSessionModal.svelte';
import SimultaneousStart from '$lib/components/pages/stopwatch/SimultaneousStart.svelte';
import AboutSunTimesModal from '$lib/components/pages/sunrise/AboutSunTimesModal.svelte';
import SunriseEditDateModal from '$lib/components/pages/sunrise/SunriseEditDateModal.svelte';
import SunriseEditLocationModal from '$lib/components/pages/sunrise/SunriseEditLocationModal.svelte';
import SunriseEditTimezoneModal from '$lib/components/pages/sunrise/SunriseEditTimezoneModal.svelte';
import ConvertTimezones from '$lib/components/pages/worldclock/ConvertTimezones.svelte';
import NewWorldclock from '$lib/components/pages/worldclock/NewWorldclock.svelte';
import WorldclockTimetable from '$lib/components/pages/worldclock/WorldclockTimetable.svelte';
import ConfirmModal from '$lib/components/ui/ConfirmModal.svelte';
import { type TIcon } from '$lib/components/ui/Icon.svelte';

interface ModalEntry {
	component: any;
	icon: TIcon;
	title: [string, string];
	size?: 'small' | 'medium';
}

type ModalData = Record<string, ModalEntry>;

export const modalData: ModalData = {
	// Generic
	'settings': {
		title: ['labels', 'Settings'],
		icon: 'settings',
		component: Settings,
		size: 'medium'
	},
	'keyboard-shortcuts': {
		title: ['labels', 'Keyboard shortcuts'],
		icon: 'table',
		component: KeyboardShortcutsModal
	},
	'confirm-modal': {
		title: ['labels', 'Confirm'],
		icon: 'check',
		component: ConfirmModal,
		size: 'small'
	},
	// Clocks
	'datetime-format': {
		title: ['clockSettings', 'Datetime Formatting'],
		icon: 'table',
		component: DatetimeFormatModal,
		size: 'small'
	},
	'modal-new-theme': {
		title: ['labels', 'New theme'],
		icon: 'plus',
		component: AnalogClockThemeEditModal,
		size: 'medium'
	},
	'modal-edit-theme': {
		title: ['labels', 'Edit theme'],
		icon: 'pencil',
		component: AnalogClockThemeEditModal,
		size: 'medium'
	},
	// Birthdays
	'add-birthday-modal': {
		title: ['birthdaysSettings', 'Add birthday'],
		icon: 'plus',
		component: AddBirthdayModal
	},
	// Calendar
	'new-event-modal': {
		title: ['calendarSettings', 'New event'],
		icon: 'plus',
		component: NewEventModal,
		size: 'medium'
	},
	'edit-event-modal': {
		title: ['calendarSettings', 'Edit event'],
		icon: 'pencil',
		component: NewEventModal,
		size: 'medium'
	},
	'events-list-modal': {
		title: ['calendarSettings', 'Events list'],
		icon: 'list',
		component: EventsListModal,
		size: 'medium'
	},
	// Chessclock
	'chessclock-settings': {
		title: ['labels', 'Settings'],
		icon: 'settings',
		component: ChessclockSettings,
		size: 'medium'
	},
	// Pomodoro
	'new-pomodoro': {
		title: ['pomodoroSettings', 'New timer'],
		icon: 'plus',
		component: NewPomodoro
	},
	'about-pomodoro': {
		title: ['settingsTabs', 'About'],
		icon: 'info',
		component: AboutPomodoro
	},
	'pomodoro-settings': {
		title: ['labels', 'Settings'],
		icon: 'settings',
		component: PomodoroSettings,
		size: 'medium'
	},
	// Rubiks
	'rubiks-scramble-guide': {
		title: ['rubiksSettings', 'Scramble Guide'],
		icon: 'info',
		component: RubiksScrambleGuideModal
	},
	'rubiks-scramble-walkthrough': {
		title: ['rubiksSettings', 'Scramble Walkthrough'],
		icon: 'info',
		component: RubiksScrambleWalkthroughModal
	},
	'rubiks-interactable-cube': {
		title: ['rubiksSettings', 'Interactable Cube'],
		icon: 'cube',
		component: RubiksInteractableCubeModal
	},
	'rubiks-sessions': {
		title: ['rubiksSettings', 'Sessions'],
		icon: 'list',
		component: RubiksSessionsModal,
		size: 'medium'
	},
	'rubiks-single-session': {
		title: ['rubiksSettings', 'Session'],
		icon: 'cube',
		component: RubiksSingleSessionModal,
		size: 'medium'
	},
	// Stopwatch
	'simultaneous-start': {
		title: ['stopwatchSettings', 'Simultaneous Start'],
		icon: 'stopwatch',
		component: SimultaneousStart
	},
	// Sunrisesunset
	'about-sun-times': {
		title: ['settingsTabs', 'About'],
		icon: 'info',
		component: AboutSunTimesModal
	},
	'sunrise-edit-date': {
		title: ['sunriseSunsetSettings', 'Edit date'],
		icon: 'pencil',
		component: SunriseEditDateModal
	},
	'sunrise-edit-location': {
		title: ['sunriseSunsetSettings', 'Edit location'],
		icon: 'pencil',
		component: SunriseEditLocationModal
	},
	'sunrise-edit-timezone': {
		title: ['sunriseSunsetSettings', 'Edit timezone'],
		icon: 'pencil',
		component: SunriseEditTimezoneModal
	},
	// Worldclock
	'convert-timezones': {
		title: ['worldclockSettings', 'Convert timezones'],
		icon: 'switch_horizontal',
		component: ConvertTimezones
	},
	'new-worldclock': {
		title: ['worldclockSettings', 'New timezone'],
		icon: 'plus',
		component: NewWorldclock
	},
	'edit-worldclock': {
		title: ['worldclockSettings', 'Edit timezone'],
		icon: 'pencil',
		component: NewWorldclock
	},
	'worldclock-timetable': {
		title: ['worldclockSettings', 'Timetable'],
		icon: 'table',
		component: WorldclockTimetable,
		size: 'medium'
	}
};
