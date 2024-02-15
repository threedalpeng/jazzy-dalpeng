/// <reference types="vitest" />
import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { defineConfig } from 'vite';

export default defineConfig({
	define: {
		__DATE__: `'${new Date().toISOString()}'`,
		__RELOAD_SW__: false,
		'process.env.NODE_ENV': process.env.NODE_ENV === 'production' ? '"production"' : '"development"'
	},
	plugins: [
		sveltekit()
		// SvelteKitPWA({
		// 	strategies: 'injectManifest',
		// 	srcDir: 'src',
		// 	// scope: '/jazz/',
		// 	filename: 'service-worker.ts',
		// 	manifest: {
		// 		name: 'JazzyDalpeng',
		// 		short_name: 'JazzyDalpeng',
		// 		// scope: '/jazz/',
		// 		// start_url: '/jazz/',
		// 		description: 'Jazz Practice Application',
		// 		theme_color: '#ffffff',
		// 		icons: [
		// 			{
		// 				src: 'pwa-192x192.png',
		// 				sizes: '192x192',
		// 				type: 'image/png'
		// 			},
		// 			{
		// 				src: 'pwa-512x512.png',
		// 				sizes: '512x512',
		// 				type: 'image/png'
		// 			}
		// 		]
		// 	},
		// 	workbox: {
		// 		navigateFallbackAllowlist: [/^\/$/], // This regex will only match the "/" route
		// 		navigateFallbackDenylist: [/^(?!\/$).*/] // This regex will match all routes except "/"
		// 	},
		// 	devOptions: {
		// 		enabled: true,
		// 		type: 'module'
		// 	}
		// })
	],
	test: {},
	server: {
		host: true,
		port: 1357
	}
});
