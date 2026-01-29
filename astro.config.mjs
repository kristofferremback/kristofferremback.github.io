// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import remarkGithubAlerts from 'remark-github-blockquote-alert';

// https://astro.build/config
export default defineConfig({
	site: 'https://kristofferremback.github.io',
	integrations: [sitemap(), mdx()],
	vite: {
		plugins: [tailwindcss()],
	},
	markdown: {
		remarkPlugins: [remarkGithubAlerts],
		shikiConfig: {
			themes: {
				light: 'github-light',
				dark: 'github-dark',
			},
			transformers: [
				{
					name: 'wrap',
					pre(node) {
						if (this.options.meta?.__raw?.includes('wrap')) {
							node.properties['data-wrap'] = '';
						}
					},
				},
			],
		},
	},
});
