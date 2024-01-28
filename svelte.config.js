import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter(),
		serviceWorker: {
			register: false
		},
		alias: {
			'$/*': 'src/*',
			'$lib/*': 'src/lib/*',
			$canvas: 'src/components/canvas/index.ts',
			'$canvas/*': 'src/components/canvas/*',
			'$assets/*': 'src/assets/*'
		},
		paths: {
			base: '/jazz'
		},
		files: {
			serviceWorker: 'src/service-worker.ts'
		}
	}
};

export default config;
