import type { Writable } from 'svelte/store';
import type { DefaultColors } from 'tailwindcss/types/generated/colors';

import type { Pattern } from '$lib/components/features/misc/BackgroundPattern.svelte';
import type { BirthdayItem } from '$lib/components/pages/birthdays/Birthdays.svelte';
import type { RubiksSession } from '$lib/components/pages/rubiks/RubiksCubeTimer.svelte';
import type { SunProperty } from '$lib/components/pages/sunrise/Sunrise.svelte';
import type { Countdown, Timer } from '$lib/components/pages/timer/Timers.svelte';
import { defaultTimezones } from '$lib/components/pages/worldclock/WorldclockSettings.svelte';
import type { fontFamilies } from '$lib/data/consts';
import type { Theme } from '$lib/stores/themes';
import type { CalendarEvent } from '$lib/util/eventManager';
import localStore from '$lib/util/localStore';
import uid from '$lib/util/uid';

const rubiksSessionID = uid();

export interface Settings {
	clock: {
		displays: {
			primary: 'time' | 'date' | 'datetime' | 'text' | 'analog';
			secondary: 'time' | 'date' | 'datetime' | 'text' | 'none';
			primaryPalette: string;
			secondaryPalette: string;
			primaryFontSize: string;
			secondaryFontSize: string;
			battery: boolean;
			text: string;
		};
		theme?: null | Theme;
		themeID: null | string;
		timeFormat: null | string;
		timeFormatCustom: null | string;
		dateFormat: string;
		dateFormatCustom: string;
		datetimeFontWeight: string;
	};
	worldclock: {
		displays: {
			primary: 'analog_digital' | 'digital' | 'none';
			secondary: 'rows' | 'compact_rows' | 'analog_grid' | 'digital_grid';
		};
		timezones: {
			name: string;
			zone: string;
		}[];
		theme?: null | Theme;
		themeID: null | string;
		timeFormat: null | string;
		timeFormatCustom: null | string;
		dateFormat: string;
		dateFormatCustom: string;
		timetable: {
			times: string[];
			ampm: null | boolean;
		};
	};
	stopwatch: {
		stopwatches: {
			times: number[];
			laps: number[];
			id: string;
			name: string;
		}[];
		alwaysShowHours: boolean;
		digitsAfterSeconds: number;
		digitsAfterSecondsLapList: number;
		showLapsChart: boolean;
		showResetButton: boolean;
		namableStopwatches: boolean;
		reverseOrderLaps: boolean;
		largerFirstStopwatch: boolean;
		autoStartStopwatches: boolean;
	};
	pomodoro: {
		displays: {
			primary: 'just_timer' | 'combined' | 'split';
			secondary: 'task_list' | 'both' | 'overview' | 'none';
		};
		autoStartBreaks: boolean;
		autoStartPomodoros: boolean;
		minutes: {
			pomodoro: number;
			shortBreak: number;
			longBreak: number;
			longBreakInterval: number;
		};
		sound: {
			name: string;
			repeat: number;
			volume: number;
		};
		timer: {
			activeTab: 'pomodoro' | 'shortBreak' | 'longBreak';
			activeTaskID: string;
			activeTaskProgress: number;
			shortBreaksSinceLongBreak: number;
			tasks: Array<{
				id: string;
				name: string;
				complete: boolean;
				description: string;
				poms: number;
			}>;
			times: number[];
		};
	};
	chessclock: {
		display: {
			flipTimeText: 'none' | 'player0' | 'player1';
		};
		shortcuts: {
			enabled: boolean;
			// TODO: options for toggling each individual shortcurt
			// Maybe: option to show keyboard shortcut info below chessclock
		};
		sound: {
			volume: number;
			soundWhenSwitch: boolean;
			soundWhenLowTime: boolean;
			soundWhenDone: boolean;
			switchSound: 'beep' | 'beepbeep' | 'decide' | 'notification' | 'up_down' | 'wind';
			lowTimeSound: 'beep' | 'beepbeep' | 'decide' | 'notification' | 'up_down' | 'wind';
			outOfTimeSound: 'beep' | 'beepbeep' | 'decide' | 'notification' | 'up_down' | 'wind';
			lowTimeThreshold: number;
		};
		timer: {
			durations: [number, number];
			lastTimestamp: number;
			paused: boolean;
			timeBetweenPause: number;
			currentTurn: 0 | 1;
		};
		timeControl: {
			startingTime: {
				min: number;
				sec: number;
			};
			increment: {
				method: 'none' | 'fischer' | 'bronstein' | 'simple_delay';
				sec: number;
			};
		};
	};
	sunrise: {
		displays: {
			primary: 'full' | 'simple' | 'none';
			secondary: 'full' | 'simple' | 'none';
		};
		timezone: null | string;
		location: {
			lat: number;
			long: number;
			name: string;
		};
		date: number;
		table: {
			show: boolean;
			rows: number;
			cols: SunProperty[];
		};
	};
	rubiks: {
		displays: {
			primary: 'timer' | 'timer_and_times'; // simple / default
			secondary: 'scramble' | 'times' | 'none';
		};
		display: {
			primaryHeight: number;
			showBackground: boolean;
		};
		timer: {
			start: number;
			stop: number;
		};
		scrambleWalkthrough: {
			autoplay: boolean;
			autoplaySpeed: number;
		};
		sessions: Record<string, RubiksSession>;
		currentSessionID: string;
		scramble: string;
		generateScrambleOnTimerStop: boolean;
	};
	calendar: {
		ampm: null | boolean;
		displays: {
			primary: 'week' | 'month' | 'month_clock' | 'year' | 'year_list';
			secondary: 'full' | 'simpledate' | 'none';
		};
		eventsEnabled: boolean;
		showEventsWhenPrinting: boolean;
		confirmBeforeDeleting: boolean;
		events: CalendarEvent[];
	};
	weather: {
		displays: {
			primary: 'full' | 'simple';
			secondary: 'daily_hourly' | 'daily' | 'hourly';
		};
		hourlyDaysShown: number;
		location: {
			lat: number;
			long: number;
			name: string;
		};
		APITimestamps: number[];
	};
	pictureinpicture: {
		activeTab: 'datetime' | 'timer';
		timer: {
			hours: number;
			minutes: number;
			startTimestamp: number;
		};
	};
	timer: {
		timers: Timer[];
		soundWhenDone: boolean;
		sound: {
			name: string;
			repeat: number;
			volume: number;
		};
		daysInput: boolean;
		input: 'numbers' | 'keypad';
		displays: {
			primary: 'default' | 'flipcard';
		};
	};
	countdown: {
		countdowns: Countdown[];
		soundWhenDone: boolean;
		sound: {
			name: string;
			repeat: number;
			volume: number;
		};
		timezoneInput: boolean;
		displays: {
			primary: 'default' | 'flipcard';
		};
	};
	timestamp: {
		displays: {
			primary: 'default' | 'tabs';
		};
	};
	birthdays: {
		birthdays: BirthdayItem[];
		displays: {
			primary: 'full' | 'simple';
			secondary: 'default' | 'simple';
			showMonthHeadings: boolean;
			showConfetti: boolean;
			showSearchbar: boolean;
			startAtCurrentMonth: boolean;
			highlightCloseBirthdays: boolean;
			highlightCloseBirthdaysDays: number;
		};
	};
	more: {
		displays: {
			primary: 'default' | 'simple';
			secondary: 'default' | 'none';
		};
	};
	pinnedPages: string[];
	pattern: {
		name: Pattern;
		opacity: 0.05 | 0.1 | 0.15 | 0.2;
		zoom: 1 | 1.5 | 2 | 2.5;
	};
	baseColorPalette: keyof DefaultColors;
	accentColorPalette: keyof DefaultColors;
	darkMode: null | boolean;
	pitchBlackMode: boolean;
	dayNightMode: boolean;
	invertMode: boolean;
	showDarkButton: boolean;
	showPrimaryButton: boolean;
	showSecondaryButton: boolean;
	showAboutButton: boolean;
	showCastButton: boolean;
	showFullscreenButton: boolean;
	smallerMenu: boolean;
	alwaysCollapseMenu: boolean;
	hideTitlebarWhenIdle: boolean;
	secondsUntilIdle: number;
	fontFamily: keyof typeof fontFamilies;
	fontFamilyBody: keyof typeof fontFamilies;
	doubleclickFullscreen: boolean;
	keyboardShortcuts: boolean;
	wakeLock: boolean;
	locale: {
		datetime: null | string;
		language: null | string;
		timezone: null | string;
		automaticDatetime: boolean;
		automaticLanguage: boolean;
		automaticTimezone: boolean;
		metric: null | boolean; // whether or not the user uses metric or usa units
	};
	recentVersion: null | string;
	screenshotMode: boolean;
}

export const defaultSettings = {
	clock: {
		displays: {
			primary: 'time',
			secondary: 'date',
			primaryPalette: 'base',
			secondaryPalette: 'base',
			primaryFontSize: 'large',
			secondaryFontSize: 'large',
			battery: false,
			text: ''
		},

		// legacy support, so this isn't removed by `mergeSettings` until after we read it
		theme: null,

		// null values overridden in _layout onMount to user device's preference
		themeID: null,
		timeFormat: null,
		timeFormatCustom: null,
		dateFormat: 'ddd, MMMM D',
		dateFormatCustom: 'ddd, MMMM D',

		datetimeFontWeight: '300'
	},
	worldclock: {
		displays: {
			primary: 'analog_digital',
			secondary: 'rows'
		},
		timezones: [...defaultTimezones],

		theme: null,

		themeID: null,
		timeFormat: null,
		timeFormatCustom: null,
		dateFormat: 'ddd, MMMM D',
		dateFormatCustom: 'ddd, MMMM D',

		timetable: {
			times: ['9:00', '12:00', '15:00', '18:00'],
			ampm: null
		}
	},
	stopwatch: {
		stopwatches: [
			// initialize the user with one new stopwatch
			{
				times: [],
				laps: [],
				id: uid(),
				name: ''
			}
		],
		alwaysShowHours: false,
		digitsAfterSeconds: 1,
		digitsAfterSecondsLapList: 3,
		showLapsChart: false,
		showResetButton: false,
		namableStopwatches: false,
		reverseOrderLaps: false,
		largerFirstStopwatch: true,
		autoStartStopwatches: false
	},
	pomodoro: {
		displays: {
			primary: 'split',
			secondary: 'both'
		},
		autoStartBreaks: false,
		autoStartPomodoros: false,
		minutes: {
			pomodoro: 25,
			shortBreak: 5,
			longBreak: 15,
			longBreakInterval: 5
		},
		sound: {
			name: 'positive',
			repeat: 1,
			volume: 50
		},
		timer: {
			activeTab: 'pomodoro',
			activeTaskID: '',
			activeTaskProgress: 0,
			shortBreaksSinceLongBreak: 0,
			tasks: [],
			times: []
		}
	},
	chessclock: {
		display: {
			flipTimeText: 'none'
		},
		shortcuts: {
			enabled: true
		},
		sound: {
			volume: 25,
			soundWhenSwitch: true,
			soundWhenLowTime: false,
			soundWhenDone: true,
			switchSound: 'beep',
			lowTimeSound: 'decide',
			outOfTimeSound: 'beepbeep',
			lowTimeThreshold: 30
		},
		timer: {
			durations: [0, 0],
			lastTimestamp: -1,
			timeBetweenPause: 0,
			paused: true,
			currentTurn: 0
		},
		timeControl: {
			startingTime: {
				min: 20,
				sec: 0
			},
			increment: {
				method: 'none',
				sec: 5
			}
		}
	},
	sunrise: {
		displays: {
			primary: 'full',
			secondary: 'full'
		},
		timezone: null,
		location: {
			lat: 0,
			long: 0,
			name: ''
		},
		date: -1, // date in ms, -1 if always today
		table: {
			show: true,
			rows: 10,
			cols: ['dawn', 'sunrise', 'solarNoon', 'sunset', 'dusk']
		}
	},
	rubiks: {
		displays: {
			primary: 'timer_and_times',
			secondary: 'scramble'
		},
		display: {
			primaryHeight: 384,
			showBackground: false
		},
		timer: {
			start: 0,
			stop: 0
		},
		scrambleWalkthrough: {
			autoplay: true,
			autoplaySpeed: 2500
		},
		sessions: {
			[rubiksSessionID]: {
				name: '',
				timestamp: Date.now(),
				times: []
			}
		},
		currentSessionID: rubiksSessionID,
		scramble: '',
		generateScrambleOnTimerStop: true
	},
	calendar: {
		ampm: null,
		displays: {
			primary: 'month',
			secondary: 'full'
		},
		eventsEnabled: false,
		showEventsWhenPrinting: true,
		confirmBeforeDeleting: true,
		events: []
	},
	weather: {
		displays: {
			primary: 'full',
			secondary: 'daily_hourly'
		},
		hourlyDaysShown: 2,
		location: {
			lat: 0,
			long: 0,
			name: ''
		},
		APITimestamps: []
	},
	pictureinpicture: {
		activeTab: 'datetime',
		timer: {
			hours: 0,
			minutes: 10,
			startTimestamp: -1
		}
	},
	timer: {
		timers: [],
		soundWhenDone: true,
		sound: {
			name: 'positive',
			repeat: 1,
			volume: 50
		},
		input: 'numbers',
		daysInput: false,
		displays: {
			primary: 'default'
		}
	},
	countdown: {
		countdowns: [],
		soundWhenDone: false,
		sound: {
			name: 'positive',
			repeat: 1,
			volume: 50
		},
		timezoneInput: false,
		displays: {
			primary: 'default'
		}
	},
	timestamp: {
		displays: {
			primary: 'default'
		}
	},
	birthdays: {
		birthdays: [],
		displays: {
			primary: 'full',
			secondary: 'default',
			showMonthHeadings: true,
			showConfetti: true,
			showSearchbar: true,
			startAtCurrentMonth: true,
			highlightCloseBirthdays: false,
			highlightCloseBirthdaysDays: 3
		}
	},
	more: {
		displays: {
			primary: 'default',
			secondary: 'default'
		}
	},
	pinnedPages: ['clock', 'worldclock', 'stopwatch', 'timer'],

	// appearance
	pattern: {
		name: 'none',
		opacity: 0.1,
		zoom: 1
	},
	baseColorPalette: 'slate',
	accentColorPalette: 'red',
	darkMode: null, // overridden in _layout onMount to user device's preference
	pitchBlackMode: false,
	dayNightMode: false,
	invertMode: false,
	showDarkButton: true,
	showPrimaryButton: true,
	showSecondaryButton: true,
	showAboutButton: true,
	showCastButton: false,
	showFullscreenButton: true,
	smallerMenu: false,
	alwaysCollapseMenu: false,
	hideTitlebarWhenIdle: false,
	secondsUntilIdle: 2,
	fontFamily: 'Montserrat',
	fontFamilyBody: 'Bitter',

	// general
	doubleclickFullscreen: false,
	keyboardShortcuts: true,
	wakeLock: false,
	locale: {
		// null values overridden in _layout onMount to user device's preference
		datetime: null,
		language: null,
		timezone: null,
		automaticDatetime: true,
		automaticLanguage: true,
		automaticTimezone: true,
		metric: null
	},

	// Used for debugging and supporting legacy code
	// mergeDeep requires that it's in the source object (to remove unnecessary keys)
	recentVersion: null,

	// Only true when generating screenshots dynamically, not for the users
	screenshotMode: false
} satisfies Settings;

// deep copy to preserve original defaultSettings
export const settings = localStore(
	'settings',
	JSON.parse(JSON.stringify(defaultSettings)),
	true
) as Writable<Settings>;
