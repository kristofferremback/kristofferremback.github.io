// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import yaml from '@rollup/plugin-yaml';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import remarkGithubAlerts from 'remark-github-blockquote-alert';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
    site: 'https://kristofferremback.github.io',
    integrations: [sitemap(), mdx(), react()],
    vite: {
        plugins: [tailwindcss(), yaml()],
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
                {
                    name: 'copy-button',
                    pre(node) {
                        const copyButton = {
                            type: 'element',
                            tagName: 'button',
                            properties: {
                                className: ['code-copy-btn'],
                                'aria-label': 'Copy code',
                                type: 'button',
                            },
                            children: [
                                {
                                    type: 'element',
                                    tagName: 'svg',
                                    properties: {
                                        width: '16',
                                        height: '16',
                                        viewBox: '0 0 24 24',
                                        fill: 'none',
                                        stroke: 'currentColor',
                                        'stroke-width': '2',
                                        'stroke-linecap': 'round',
                                        'stroke-linejoin': 'round',
                                    },
                                    children: [
                                        {
                                            type: 'element',
                                            tagName: 'rect',
                                            properties: { x: '9', y: '9', width: '13', height: '13', rx: '2', ry: '2' },
                                            children: [],
                                        },
                                        {
                                            type: 'element',
                                            tagName: 'path',
                                            properties: { d: 'M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1' },
                                            children: [],
                                        },
                                    ],
                                },
                            ],
                        };
                        node.children.push(copyButton);
                    },
                },
            ],
        },
    },
});