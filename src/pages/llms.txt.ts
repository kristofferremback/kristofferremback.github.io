import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
	const posts = (await getCollection('blog'))
		.filter((p) => !p.data.draft)
		.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

	const recipes = (await getCollection('recipes'))
		.filter((r) => !r.data.draft)
		.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

	const postList = posts.map((p) => `- /ai/blog/${p.id}`).join('\n');
	const recipeList = recipes.map((r) => `- /ai/recipes/${r.id}`).join('\n');

	const body = `# Kristoffer Remback — Personal Site

> Personal website with blog posts and recipes.

This site provides LLM-friendly markdown endpoints for all content.

## Blog Posts

Blog posts are available as rendered HTML at \`/blog/{id}\` and as raw markdown at \`/ai/blog/{id}\`.

${postList}

## Recipes

Recipes are available as rendered HTML at \`/recipes/{id}\` and as raw markdown at \`/ai/recipes/{id}\`.
Recipe markdown includes structured ingredients and macros tables.

${recipeList}

## Feeds

- RSS (blog only): /rss.xml
`;

	return new Response(body, {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' },
	});
};
