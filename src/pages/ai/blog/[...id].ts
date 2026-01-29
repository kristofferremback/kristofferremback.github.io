import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import remarkStringify from 'remark-stringify';
import { remove } from 'unist-util-remove';
import { visit } from 'unist-util-visit';
import fs from 'node:fs';
import path from 'node:path';

export const getStaticPaths: GetStaticPaths = async () => {
	const posts = await getCollection('blog');
	return posts
		.filter((post) => !post.data.draft)
		.map((post) => ({ params: { id: post.id }, props: { post } }));
};

async function mdxToMarkdown(body: string, postId: string): Promise<string> {
	// Extract raw imports to inline later
	const rawImports: Record<string, string> = {};
	const importRegex = /^import\s+(\w+)\s+from\s+["']([^"']+)\?raw["'];?\s*$/gm;
	let match;

	while ((match = importRegex.exec(body)) !== null) {
		const [, varName, importPath] = match;
		const resolvedPath = path.resolve('src/content/blog', path.dirname(postId), importPath);
		try {
			rawImports[varName] = fs.readFileSync(resolvedPath, 'utf-8');
		} catch {
			rawImports[varName] = `[Could not load: ${importPath}]`;
		}
	}

	const file = await unified()
		.use(remarkParse)
		.use(remarkMdx)
		.use(() => (tree) => {
			// Remove all import/export declarations
			remove(tree, 'mdxjsEsm');

			// First pass: Replace RawFile components with code blocks (including nested ones)
			visit(tree, 'mdxJsxFlowElement', (node: any, index, parent) => {
				if (!parent || index === undefined) return;

				if (node.name === 'RawFile') {
					const contentAttr = node.attributes?.find(
						(attr: any) => attr.name === 'content'
					);
					const varName = contentAttr?.value?.expression?.name || contentAttr?.value?.value;
					if (varName) {
						const content = rawImports[varName] || `[Content: ${varName}]`;
						parent.children[index] = {
							type: 'code',
							lang: 'markdown',
							value: content.trim(),
						};
					}
				}
			});

			// Second pass: Handle details/summary elements
			visit(tree, 'mdxJsxFlowElement', (node: any, index, parent) => {
				if (!parent || index === undefined) return;

				if (node.name === 'details') {
					const summaryNode = node.children?.find(
						(child: any) => child.type === 'mdxJsxFlowElement' && child.name === 'summary'
					);
					const summaryText = summaryNode?.children?.[0]?.value || 'Details';

					// Collect non-summary children and stringify them
					const innerChildren = node.children?.filter(
						(child: any) => !(child.type === 'mdxJsxFlowElement' && child.name === 'summary')
					) || [];

					// Convert inner children back to markdown
					const innerParts: string[] = [];
					for (const child of innerChildren) {
						if (child.type === 'code') {
							const lang = child.lang || '';
							innerParts.push(`\`\`\`${lang}\n${child.value}\n\`\`\``);
						} else if (child.type === 'paragraph') {
							// Simple text extraction
							const text = child.children?.map((c: any) => c.value || '').join('') || '';
							if (text.trim()) innerParts.push(text);
						} else if (child.type === 'text') {
							if (child.value?.trim()) innerParts.push(child.value);
						}
					}

					parent.children[index] = {
						type: 'html',
						value: `<details>\n<summary>${summaryText}</summary>\n\n${innerParts.join('\n\n')}\n\n</details>`,
					};
				}
			});

			// Remove any remaining JSX elements
			remove(tree, 'mdxJsxFlowElement');
			remove(tree, 'mdxJsxTextElement');
		})
		.use(remarkStringify, {
			bullet: '-',
			fences: true,
			listItemIndent: 'one',
		})
		.process(body);

	return String(file);
}

export const GET: APIRoute = async ({ props }) => {
	const { post } = props;
	const { title, description, pubDate } = post.data;
	const dateStr = pubDate.toISOString().split('T')[0];

	const normalizedBody = await mdxToMarkdown(post.body || '', post.id);

	const markdown = `# ${title}

> ${description}

Date: ${dateStr}

---

${normalizedBody}`;

	return new Response(markdown, {
		headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
	});
};
