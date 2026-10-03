import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import Icons from 'unplugin-icons/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [
		sveltekit({
			adapter: adapter({ fallback: '404.html' }),
			preprocess: vitePreprocess(),
			compilerOptions: { runes: true },
			paths: { base: '/jazzy-dalpeng' }
		}),
		Icons({ compiler: 'svelte' })
	],
	test: { include: ['test/**/*.test.ts'] },
	server: { host: true, port: 1357 }
});
