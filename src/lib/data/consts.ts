export const supportedLangs = ['en', 'es', 'fr', 'hi'] as const;

export const appURL = 'https://desktopclock.app';

// Order matters: this determines the order of about page cards
// Clock first, then alphabetical
const apps = {
	clock: '/',
	birthdays: '/birthdays',
	calendar: '/calendar',
	chessclock: '/chessclock',
	countdown: '/countdown',
	pictureinpicture: '/pictureinpicture',
	pomodoro: '/pomodoro',
	rubikscube: '/rubikscube',
	stopwatch: '/stopwatch',
	sunrisesunset: '/sunrisesunset',
	timer: '/timer',
	timestamp: '/timestamp',
	weather: '/weather',
	worldclock: '/worldclock'
};

export const appNames = Object.keys(apps);
export const appPages = Object.values(apps);

export const validPages = [
	...appPages,
	'/about',
	'/changelog',
	'/more',
	...appNames.map((page) => `/about/${page}`),
	'/about/app',
	'/about/dates',
	'/about/goals',
	'/about/time'
] as const;

// TODO: should we move this to `types.ts`?
declare global {
	type ValidPages = ArrayValues<typeof validPages>;
	type AppPages = ArrayValues<typeof appPages>;
	type PageIcons = ArrayValues<typeof appNames> | 'more' | 'about' | 'changelog';
}

export const lightnesses = [
	'50',
	'100',
	'200',
	'300',
	'400',
	'500',
	'600',
	'700',
	'800',
	'900'
] as const;

export const movements = ['sweeping', 'grandfather', 'modern'] as const;

export const defaultTimeFormats = [
	'H:mm',
	'H:mm:ss',
	'h:mm A',
	'h:mm:ss A',
	'H:mm Z',
	'H:mm:ss Z',
	'h:mm A Z',
	'h:mm:ss A Z',
	'mm:ss',
	'custom'
] as const;

export const defaultDateFormats = [
	'MMM D',
	'MMM D YYYY',
	'ddd, MMMM D',
	'ddd, MMMM D YYYY',
	'D MMM',
	'D MMM YYYY',
	'ddd, D MMM',
	'ddd, D MMM YYYY',
	'custom'
] as const;

export const timeFormatSettings = [
	'timeFormat',
	'timeFormatCustom',
	'dateFormat',
	'dateFormatCustom'
] as const;

export const numeralStyles = {
	numerals: ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'],
	fourNumerals: ['', '', 'III', '', '', 'VI', '', '', 'IX', '', '', 'XII'],
	// oneNumeral: ['', '', '', '', '', '', '', '', '', '', '', 'XII'],
	numbers: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
	fourNumbers: ['', '', '3', '', '', '6', '', '', '9', '', '', '12'],
	// oneNumber: ['', '', '', '', '', '', '', '', '', '', '', '12'],
	none: []
} as const;

// We only use light (300), normal (400), and bold (700) weights
export const fontFamilies = {
	'Aldrich': [400],
	'Arsenal': [400, 700],
	'Bai Jamjuree': [300, 500, 700],
	'Bitter': [300, 500, 700],
	'Comfortaa': [300, 400, 700],
	'Josefin Sans': [300, 400, 700],
	'Julius Sans One': [400],
	'Jura': [300, 500, 700],
	'K2D': [300, 500, 700],
	'KoHo': [300, 500, 700],
	'Libre Baskerville': [400, 700],
	'Limelight': [400],
	'Major Mono Display': [400],
	'Montserrat': [300, 500, 700],
	'Montserrat Alternates': [300, 600, 900],
	'Orbitron': [400, 700],
	'Yatra One': [300, 500, 700],
	'': [100, 200, 300, 400, 500, 600, 700, 800, 900]
} as const;

export const pomodoroStates = ['pomodoro', 'shortBreak', 'longBreak'] as const;
export const systemFontFamilies =
	"ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'";

export const locales = [
	'af',
	'am',
	'ar',
	'az',
	'be',
	'bg',
	'bi',
	'bm',
	'bn',
	'bo',
	'br',
	'bs',
	'ca',
	'cs',
	'cv',
	'cy',
	'da',
	'de',
	'dv',
	'el',
	'en',
	'eo',
	'es',
	'eu',
	'fa',
	'fi',
	'fo',
	'fr',
	'fy',
	'ga',
	'gd',
	'gl',
	'gu',
	'he',
	'hi',
	'hr',
	'ht',
	'hu',
	'id',
	'is',
	'it',
	'ja',
	'jv',
	'ka',
	'kk',
	'km',
	'kn',
	'ko',
	'ku',
	'ky',
	'lb',
	'lo',
	'lt',
	'lv',
	'me',
	'mi',
	'mk',
	'ml',
	'mn',
	'mr',
	'ms',
	'mt',
	'my',
	'nb',
	'ne',
	'nl',
	'nn',
	'pl',
	'pt',
	'ro',
	'ru',
	'rw',
	'sd',
	'se',
	'si',
	'sk',
	'sl',
	'sq',
	'sr',
	'ss',
	'sv',
	'sw',
	'ta',
	'te',
	'tet',
	'tg',
	'th',
	'tk',
	'tlh',
	'tr',
	'tzl',
	'tzm',
	'uk',
	'ur',
	'uz',
	'vi',
	'yo',
	'zh',
	'et'
] as const;

// Copied from `settings.ts` - TODO dedupe
interface TimeControl {
	startingTime: {
		min: number;
		sec: number;
	};
	increment: {
		method: 'none' | 'fischer' | 'bronstein' | 'simple_delay';
		sec: number;
	};
}

export const chessclockTimingPresets = [
	{
		startingTime: {
			min: 1,
			sec: 0
		},
		increment: {
			method: 'none',
			sec: 0
		}
	},
	{
		startingTime: {
			min: 1,
			sec: 0
		},
		increment: {
			method: 'fischer',
			sec: 1
		}
	},
	{
		startingTime: {
			min: 2,
			sec: 0
		},
		increment: {
			method: 'fischer',
			sec: 1
		}
	},
	{
		startingTime: {
			min: 3,
			sec: 0
		},
		increment: {
			method: 'none',
			sec: 0
		}
	},
	{
		startingTime: {
			min: 3,
			sec: 0
		},
		increment: {
			method: 'fischer',
			sec: 2
		}
	},
	{
		startingTime: {
			min: 5,
			sec: 0
		},
		increment: {
			method: 'none',
			sec: 0
		}
	},
	{
		startingTime: {
			min: 5,
			sec: 0
		},
		increment: {
			method: 'fischer',
			sec: 5
		}
	},
	{
		startingTime: {
			min: 10,
			sec: 0
		},
		increment: {
			method: 'none',
			sec: 0
		}
	},
	{
		startingTime: {
			min: 15,
			sec: 0
		},
		increment: {
			method: 'fischer',
			sec: 10
		}
	},
	{
		startingTime: {
			min: 20,
			sec: 0
		},
		increment: {
			method: 'none',
			sec: 0
		}
	},
	{
		startingTime: {
			min: 30,
			sec: 0
		},
		increment: {
			method: 'none',
			sec: 0
		}
	},
	{
		startingTime: {
			min: 60,
			sec: 0
		},
		increment: {
			method: 'none',
			sec: 0
		}
	}
] as TimeControl[];
