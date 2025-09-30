import adapter from '@sveltejs/adapter-static';
import { sveltePreprocess } from 'svelte-preprocess';

const config = {
	kit: {
		adapter: adapter(),
		alias: {
			$: 'src',
		},
		prerender: {
			entries: ['/', '/more'],
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
