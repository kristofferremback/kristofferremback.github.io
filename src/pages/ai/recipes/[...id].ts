import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { calculateRecipeMacros, isSectioned, type ResolvedIngredient } from '../../../lib/macros';

export const getStaticPaths: GetStaticPaths = async () => {
	const recipes = await getCollection('recipes');
	return recipes
		.filter((recipe) => !recipe.data.draft)
		.map((recipe) => ({ params: { id: recipe.id }, props: { recipe } }));
};

function formatIngredientRow(i: ResolvedIngredient): string {
	return `| ${i.amount} ${i.unit} | ${i.name} |`;
}

export const GET: APIRoute = ({ props }) => {
	const { recipe } = props;
	const { title, description, servings, ingredients, prepTime, cookTime } = recipe.data;

	const { perServing, resolved } = calculateRecipeMacros(ingredients, servings);

	const timeLine = [prepTime && `Prep: ${prepTime}`, cookTime && `Cook: ${cookTime}`]
		.filter(Boolean)
		.join(' | ');

	let ingredientsSection: string;
	if (isSectioned(resolved)) {
		ingredientsSection = resolved.sections
			.map(
				(section) =>
					`### ${section.name}\n\n| Amount | Ingredient |\n|--------|------------|\n${section.ingredients.map(formatIngredientRow).join('\n')}`
			)
			.join('\n\n');
	} else {
		ingredientsSection = `| Amount | Ingredient |\n|--------|------------|\n${resolved.map(formatIngredientRow).join('\n')}`;
	}

	const markdown = `# ${title}

> ${description}

Servings: ${servings}${timeLine ? `\n${timeLine}` : ''}

## Macros (per serving)

| Calories | Protein | Carbs | Fat | Fiber |
|----------|---------|-------|-----|-------|
| ${perServing.calories} | ${perServing.protein}g | ${perServing.carbs}g | ${perServing.fat}g | ${perServing.fiber}g |

## Ingredients

${ingredientsSection}

${recipe.body}`;

	return new Response(markdown, {
		headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
	});
};
