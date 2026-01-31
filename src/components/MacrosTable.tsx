import { resolveIngredient, type RecipeIngredient } from '../lib/macros';
import type { IngredientMacros } from '../lib/ingredients';

interface Props {
	ingredients: RecipeIngredient[];
}

function round(n: number, decimals = 1): number {
	const factor = Math.pow(10, decimals);
	return Math.round(n * factor) / factor;
}

function sumMacros(macrosList: IngredientMacros[]): IngredientMacros {
	const sum = macrosList.reduce(
		(acc, m) => ({
			calories: acc.calories + m.calories,
			protein: acc.protein + m.protein,
			carbs: acc.carbs + m.carbs,
			fat: acc.fat + m.fat,
			fiber: acc.fiber + m.fiber,
		}),
		{ calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
	);
	return {
		calories: Math.round(sum.calories),
		protein: round(sum.protein),
		carbs: round(sum.carbs),
		fat: round(sum.fat),
		fiber: round(sum.fiber),
	};
}

export function MacrosTable({ ingredients }: Props) {
	const resolved = ingredients.map(resolveIngredient);
	const total = sumMacros(resolved.map((r) => r.macros));

	return (
		<div className="my-6 overflow-x-auto not-prose">
			<table className="w-full text-sm border-collapse">
				<thead>
					<tr className="border-b border-stone-200 dark:border-stone-700 text-left text-stone-500 dark:text-stone-400">
						<th className="py-2 pr-4 font-medium">Ingredient</th>
						<th className="py-2 px-2 font-medium text-right tabular-nums">Amount</th>
						<th className="py-2 px-2 font-medium text-right tabular-nums">Cal</th>
						<th className="py-2 px-2 font-medium text-right tabular-nums">P</th>
						<th className="py-2 px-2 font-medium text-right tabular-nums">C</th>
						<th className="py-2 px-2 font-medium text-right tabular-nums">Fat</th>
						<th className="py-2 pl-2 font-medium text-right tabular-nums">Fiber</th>
					</tr>
				</thead>
				<tbody className="text-stone-700 dark:text-stone-300">
					{resolved.map((item, i) => (
						<tr key={i} className="border-b border-stone-100 dark:border-stone-800">
							<td className="py-2 pr-4">{item.name}</td>
							<td className="py-2 px-2 text-right tabular-nums text-stone-500 dark:text-stone-400">
								{item.amount} {item.unit}
							</td>
							<td className="py-2 px-2 text-right tabular-nums">{Math.round(item.macros.calories)}</td>
							<td className="py-2 px-2 text-right tabular-nums">{round(item.macros.protein)}g</td>
							<td className="py-2 px-2 text-right tabular-nums">{round(item.macros.carbs)}g</td>
							<td className="py-2 px-2 text-right tabular-nums">{round(item.macros.fat)}g</td>
							<td className="py-2 pl-2 text-right tabular-nums">{round(item.macros.fiber)}g</td>
						</tr>
					))}
				</tbody>
				{resolved.length > 1 && (
					<tfoot>
						<tr className="font-medium text-stone-900 dark:text-stone-100">
							<td className="py-2 pr-4">Total</td>
							<td className="py-2 px-2"></td>
							<td className="py-2 px-2 text-right tabular-nums">{total.calories}</td>
							<td className="py-2 px-2 text-right tabular-nums">{total.protein}g</td>
							<td className="py-2 px-2 text-right tabular-nums">{total.carbs}g</td>
							<td className="py-2 px-2 text-right tabular-nums">{total.fat}g</td>
							<td className="py-2 pl-2 text-right tabular-nums">{total.fiber}g</td>
						</tr>
					</tfoot>
				)}
			</table>
		</div>
	);
}
