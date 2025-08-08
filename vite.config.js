import { fileURLToPath, URL } from 'node:url';

import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		vue({
			template: {
				compilerOptions: {
					isCustomElement: tag => ['marquee'].includes(tag),
				},
			},
		}),
		// vueDevTools(),
	],
	base: './',
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
		},
	},
	build: {
		outDir: 'docs',
		target: 'ES2022',
		emptyOutDir: true,
		minify: 'esbuild',
		cssMinify: 'esbuild',
	},
	server: {
		open: true,
		port: 5501,
		allowedHosts: ['streamerbot.nomercy.tv'],
	},
});
