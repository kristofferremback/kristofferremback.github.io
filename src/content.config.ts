import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
	loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		draft: z.boolean().default(false),
		tags: z.array(z.string()).default([]),
	}),
});

const recipes = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/recipes' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		pubDate: z.coerce.date(),
		draft: z.boolean().default(false),
		tags: z.array(z.string()).default([]),
		prepTime: z.string().optional(),
		cookTime: z.string().optional(),
		servings: z.number(),
		macros: z.object({
			calories: z.number(),
			protein: z.number(),
			carbs: z.number(),
			fat: z.number(),
			fiber: z.number().default(0),
		}),
		ingredients: z.array(
			z.object({
				name: z.string(),
				amount: z.number(),
				unit: z.string(),
			})
		),
	}),
});

export const collections = { blog, recipes };
