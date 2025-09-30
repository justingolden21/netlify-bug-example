import { sveltekit } from '@sveltejs/kit/vite';

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';

const file = fileURLToPath(new URL('package.json', import.meta.url));
const json = readFileSync(file, 'utf8');
const pkg = JSON.parse(json);

const config = {
	define: {
		__version__: JSON.stringify(pkg.version),
	},
	build: {
		rollupOptions: {
			external: ['@tauri-apps/api'],
		},
		target: 'es2015',
	},
	plugins: [sveltekit()],
};

export default config;
