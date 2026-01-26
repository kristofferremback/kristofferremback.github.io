import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';

export const getStaticPaths: GetStaticPaths = async () => {
	const recipes = await getCollection('recipes');
	return recipes
		.filter((recipe) => !recipe.data.draft)
		.map((recipe) => ({ params: { id: recipe.id }, props: { recipe } }));
};

export const GET: APIRoute = ({ props }) => {
	const { recipe } = props;
	const { title, description, servings, macros, ingredients, prepTime, cookTime } = recipe.data;

	const timeLine = [prepTime && `Prep: ${prepTime}`, cookTime && `Cook: ${cookTime}`]
		.filter(Boolean)
		.join(' | ');

	const ingredientRows = ingredients
		.map((i) => `| ${i.amount} ${i.unit} | ${i.name} |`)
		.join('\n');

	const markdown = `# ${title}

> ${description}

Servings: ${servings}${timeLine ? `\n${timeLine}` : ''}

## Macros (per serving)

| Calories | Protein | Carbs | Fat |
|----------|---------|-------|-----|
| ${macros.calories} | ${macros.protein}g | ${macros.carbs}g | ${macros.fat}g |

## Ingredients

| Amount | Ingredient |
|--------|------------|
${ingredientRows}

${recipe.body}`;

	return new Response(markdown, {
		headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
	});
};
