import { getIngredient, type IngredientEntry, type IngredientMacros } from './ingredients';

export interface RecipeIngredient {
	ref: string;
	name?: string;
	amount: number;
	unit: string;
	grams_per_unit?: number;
}

export interface ResolvedIngredient {
	name: string;
	amount: number;
	unit: string;
	grams: number;
	macros: IngredientMacros;
}

export interface RecipeMacroResult {
	total: IngredientMacros;
	perServing: IngredientMacros;
	resolved: ResolvedIngredient[];
}

const WEIGHT_TO_GRAMS: Record<string, number> = {
	g: 1,
	kg: 1000,
	oz: 28.35,
};

const VOLUME_TO_DL: Record<string, number> = {
	ml: 0.01,
	dl: 1,
	l: 10,
	tbsp: 0.15,
	tsp: 0.05,
	cup: 2.4,
};

function isWeightUnit(unit: string): boolean {
	return unit in WEIGHT_TO_GRAMS;
}

function isVolumeUnit(unit: string): boolean {
	return unit in VOLUME_TO_DL;
}

export function toGrams(
	amount: number,
	unit: string,
	ingredient: IngredientEntry,
	gramsPerUnit?: number
): number {
	// Weight units always work directly
	if (isWeightUnit(unit)) {
		return amount * WEIGHT_TO_GRAMS[unit];
	}

	// Recipe-level override takes highest priority
	if (gramsPerUnit !== undefined) {
		return amount * gramsPerUnit;
	}

	// Check ingredient's centralized unit conversions
	if (ingredient.units?.[unit] !== undefined) {
		return amount * ingredient.units[unit];
	}

	// Volume units require g_per_dl on the ingredient
	if (isVolumeUnit(unit)) {
		if (ingredient.g_per_dl === undefined) {
			throw new Error(
				`Ingredient "${ingredient.ref}" requires g_per_dl for volume unit "${unit}"`
			);
		}
		const dl = amount * VOLUME_TO_DL[unit];
		return dl * ingredient.g_per_dl;
	}

	// Count unit not found anywhere
	throw new Error(
		`Unit "${unit}" for ingredient "${ingredient.ref}" requires either units.${unit} on ingredient or grams_per_unit in recipe`
	);
}

export function calculateMacros(grams: number, per100g: IngredientMacros): IngredientMacros {
	const factor = grams / 100;
	return {
		calories: Math.round(per100g.calories * factor),
		protein: Math.round(per100g.protein * factor * 10) / 10,
		carbs: Math.round(per100g.carbs * factor * 10) / 10,
		fat: Math.round(per100g.fat * factor * 10) / 10,
		fiber: Math.round(per100g.fiber * factor * 10) / 10,
	};
}

export function resolveIngredient(ingredient: RecipeIngredient): ResolvedIngredient {
	const entry = getIngredient(ingredient.ref);
	const grams = toGrams(ingredient.amount, ingredient.unit, entry, ingredient.grams_per_unit);
	const macros = calculateMacros(grams, entry.per100g);

	return {
		name: ingredient.name ?? entry.name,
		amount: ingredient.amount,
		unit: ingredient.unit,
		grams,
		macros,
	};
}

function sumMacros(macrosList: IngredientMacros[]): IngredientMacros {
	return macrosList.reduce(
		(acc, m) => ({
			calories: acc.calories + m.calories,
			protein: acc.protein + m.protein,
			carbs: acc.carbs + m.carbs,
			fat: acc.fat + m.fat,
			fiber: acc.fiber + m.fiber,
		}),
		{ calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
	);
}

function divideMacros(macros: IngredientMacros, divisor: number): IngredientMacros {
	return {
		calories: Math.round(macros.calories / divisor),
		protein: Math.round((macros.protein / divisor) * 10) / 10,
		carbs: Math.round((macros.carbs / divisor) * 10) / 10,
		fat: Math.round((macros.fat / divisor) * 10) / 10,
		fiber: Math.round((macros.fiber / divisor) * 10) / 10,
	};
}

export function calculateRecipeMacros(
	ingredients: RecipeIngredient[],
	servings: number
): RecipeMacroResult {
	const resolved = ingredients.map(resolveIngredient);
	const total = sumMacros(resolved.map((r) => r.macros));
	const perServing = divideMacros(total, servings);

	return { total, perServing, resolved };
}
