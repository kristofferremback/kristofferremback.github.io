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

const ingredientSchema = z.object({
	ref: z.string(),
	name: z.string().optional(),
	amount: z.number(),
	unit: z.string(),
	grams_per_unit: z.number().optional(),
});

const sectionSchema = z.object({
	name: z.string(),
	ingredients: z.array(ingredientSchema),
});

const ingredientsSchema = z.union([
	z.array(ingredientSchema),
	z.object({ sections: z.array(sectionSchema) }),
]);

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
		ingredients: ingredientsSchema,
	}),
});

export const collections = { blog, recipes };
