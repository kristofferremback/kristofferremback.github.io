// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import remarkGithubAlerts from 'remark-github-blockquote-alert';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

// https://astro.build/config
export default defineConfig({
	site: 'https://kristofferremback.github.io',
	integrations: [sitemap(), mdx()],
	vite: {
		plugins: [tailwindcss()],
	},
	markdown: {
		remarkPlugins: [remarkGithubAlerts],
		rehypePlugins: [
			rehypeSlug,
			[
				rehypeAutolinkHeadings,
				{
					behavior: 'prepend',
					content: {
						type: 'element',
						tagName: 'span',
						properties: { className: ['heading-anchor'] },
						children: [{ type: 'text', value: '#' }],
					},
				},
			],
		],
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
