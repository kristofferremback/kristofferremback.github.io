import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';

export const getStaticPaths: GetStaticPaths = async () => {
	const posts = await getCollection('blog');
	return posts
		.filter((post) => !post.data.draft)
		.map((post) => ({ params: { id: post.id }, props: { post } }));
};

export const GET: APIRoute = ({ props }) => {
	const { post } = props;
	const { title, description, pubDate } = post.data;
	const dateStr = pubDate.toISOString().split('T')[0];

	const markdown = `# ${title}

> ${description}

Date: ${dateStr}

---

${post.body}`;

	return new Response(markdown, {
		headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
	});
};
