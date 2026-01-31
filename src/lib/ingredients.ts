import ingredientsData from '../data/ingredients.yaml';

export interface IngredientMacros {
	calories: number;
	protein: number;
	carbs: number;
	fat: number;
	fiber: number;
}

export interface IngredientSource {
	url?: string;
	label?: string;
	image?: string;
}

export interface IngredientEntry {
	ref: string;
	name: string;
	per100g: IngredientMacros;
	g_per_dl?: number;
	units?: Record<string, number>;
	sources?: IngredientSource[];
	notes?: string;
}

interface IngredientsFile {
	ingredients: IngredientEntry[];
}

let ingredientsCache: Map<string, IngredientEntry> | null = null;

function loadIngredients(): Map<string, IngredientEntry> {
	if (ingredientsCache) {
		return ingredientsCache;
	}

	const data = ingredientsData as IngredientsFile;

	ingredientsCache = new Map();
	for (const ingredient of data.ingredients) {
		ingredientsCache.set(ingredient.ref, ingredient);
	}

	return ingredientsCache;
}

export function getIngredient(ref: string): IngredientEntry {
	const ingredients = loadIngredients();
	const ingredient = ingredients.get(ref);
	if (!ingredient) {
		throw new Error(`Unknown ingredient ref: "${ref}"`);
	}
	return ingredient;
}

export function getAllIngredients(): IngredientEntry[] {
	const ingredients = loadIngredients();
	return Array.from(ingredients.values());
}
