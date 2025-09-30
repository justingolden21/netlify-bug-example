import adapter from '@sveltejs/adapter-static';
import { sveltePreprocess } from 'svelte-preprocess';

const config = {
	kit: {
		adapter: adapter(),
		alias: {
			$: 'src',
		},
		prerender: {
			entries: [
				'/',
				'/worldclock',
				'/stopwatch',
				'/pomodoro',
				'/chessclock',
				'/sunrisesunset',
				'/rubikscube',
				'/calendar',
				'/weather',
				'/pictureinpicture',
				'/timer',
				'/countdown',
				'/timestamp',
				'/birthdays',

				'/about',
				'/changelog',
				'/more',

				'/about/clock',
				'/about/worldclock',
				'/about/stopwatch',
				'/about/pomodoro',
				'/about/chessclock',
				'/about/sunrisesunset',
				'/about/rubikscube',
				'/about/calendar',
				'/about/weather',
				'/about/pictureinpicture',
				'/about/timer',
				'/about/countdown',
				'/about/timestamp',
				'/about/birthdays',

				'/about/app',
				'/about/goals',
				'/about/time',
				'/about/dates',
			],
		},
	},

	preprocess: [
		sveltePreprocess({
			defaults: {
				style: 'postcss',
			},
			postcss: true,
		}),
	],
	compilerOptions: {
		runes: true,
	},
};

export default config;
