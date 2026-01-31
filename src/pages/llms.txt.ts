import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async ({ site }) => {
	const baseUrl = site?.href || 'https://kristofferremback.github.io';

	const posts = (await getCollection('blog'))
		.filter((p) => !p.data.draft)
		.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

	const recipes = (await getCollection('recipes'))
		.filter((r) => !r.data.draft)
		.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

	const postList = posts
		.map((p) => `- [${p.data.title}](${baseUrl}ai/blog/${p.id}): ${p.data.description}`)
		.join('\n');

	const recipeList = recipes
		.map((r) => `- [${r.data.title}](${baseUrl}ai/recipes/${r.id}): ${r.data.description}`)
		.join('\n');

	const body = `# Kristoffer Remback

> Personal blog and recipe collection focused on software engineering and healthy living.

This site provides AI-friendly markdown endpoints for all content.

## Blog Posts

${postList}

## Recipes

Recipes include detailed nutritional information (calories, protein, carbs, fat, fiber per serving).

${recipeList}

## API Endpoints

All content is available as raw markdown:

- \`GET /ai/blog/{post-id}\` → Blog post as \`text/markdown\`
- \`GET /ai/recipes/{recipe-id}\` → Recipe with ingredients, macros, and instructions as \`text/markdown\`

## Site Structure

- \`/\` - Homepage with blog post list
- \`/blog/{id}\` - Individual blog posts (HTML)
- \`/recipes\` - Recipe collection
- \`/recipes/{id}\` - Individual recipes with interactive portion calculator (HTML)
- \`/tags/{tag}\` - Content filtered by tag
- \`/rss.xml\` - RSS feed (blog only)
`;

	return new Response(body, {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' },
	});
};
