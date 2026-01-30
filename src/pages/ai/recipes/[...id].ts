import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { calculateRecipeMacros } from '../../../lib/macros';

export const getStaticPaths: GetStaticPaths = async () => {
	const recipes = await getCollection('recipes');
	return recipes
		.filter((recipe) => !recipe.data.draft)
		.map((recipe) => ({ params: { id: recipe.id }, props: { recipe } }));
};

export const GET: APIRoute = ({ props }) => {
	const { recipe } = props;
	const { title, description, servings, ingredients, prepTime, cookTime } = recipe.data;

	const { perServing, resolved } = calculateRecipeMacros(ingredients, servings);

	const timeLine = [prepTime && `Prep: ${prepTime}`, cookTime && `Cook: ${cookTime}`]
		.filter(Boolean)
		.join(' | ');

	const ingredientRows = resolved
		.map((i) => `| ${i.amount} ${i.unit} | ${i.name} |`)
		.join('\n');

	const markdown = `# ${title}

> ${description}

Servings: ${servings}${timeLine ? `\n${timeLine}` : ''}

## Macros (per serving)

| Calories | Protein | Carbs | Fat | Fiber |
|----------|---------|-------|-----|-------|
| ${perServing.calories} | ${perServing.protein}g | ${perServing.carbs}g | ${perServing.fat}g | ${perServing.fiber}g |

## Ingredients

| Amount | Ingredient |
|--------|------------|
${ingredientRows}

${recipe.body}`;

	return new Response(markdown, {
		headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
	});
};
