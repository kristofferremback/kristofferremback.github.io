import { useState, useEffect, useCallback } from 'react';
import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Macros {
	calories: number;
	protein: number;
	carbs: number;
	fat: number;
	fiber: number;
}

interface Ingredient {
	name: string;
	amount: number;
	unit: string;
}

interface Props {
	baseServings: number;
	ingredients: Ingredient[];
	macros: Macros;
}

function round(n: number): number {
	return Math.round(n * 10) / 10;
}

export function PortionCalculator({ baseServings, ingredients, macros }: Props) {
	const [servings, setServings] = useState(baseServings);
	const [inputValue, setInputValue] = useState(String(baseServings));

	const dispatchUpdate = useCallback(
		(newServings: number) => {
			const ratio = newServings / baseServings;
			const amounts = ingredients.map((ing) => round(ing.amount * ratio));
			window.dispatchEvent(
				new CustomEvent('ingredients-update', {
					detail: { amounts, servings: newServings, ratio },
				})
			);
		},
		[baseServings, ingredients]
	);

	const updateServings = useCallback(
		(newServings: number) => {
			if (newServings < 1) return;
			setServings(newServings);
			setInputValue(String(newServings));
			dispatchUpdate(newServings);
		},
		[dispatchUpdate]
	);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setInputValue(value);

		const parsed = parseInt(value, 10);
		if (!isNaN(parsed) && parsed >= 1) {
			setServings(parsed);
			dispatchUpdate(parsed);
		}
	};

	const handleInputBlur = () => {
		const parsed = parseInt(inputValue, 10);
		if (isNaN(parsed) || parsed < 1) {
			setInputValue(String(servings));
		}
	};

	const increment = () => updateServings(servings + 1);
	const decrement = () => updateServings(servings - 1);

	useEffect(() => {
		dispatchUpdate(servings);
	}, []);

	const totalMacros = {
		calories: round(macros.calories * servings),
		protein: round(macros.protein * servings),
		carbs: round(macros.carbs * servings),
		fat: round(macros.fat * servings),
		fiber: round(macros.fiber * servings),
	};

	return (
		<div>
			<div className="flex items-center justify-between mb-5">
				<h3 className="text-sm font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
					Nutrition
				</h3>
				<div className="flex items-center gap-1">
					<span className="text-sm text-stone-500 dark:text-stone-400 mr-1">Servings</span>
					<Button
						variant="outline"
						size="icon"
						onClick={decrement}
						disabled={servings <= 1}
						aria-label="Decrease servings"
						className="h-8 w-8"
					>
						<Minus className="h-4 w-4" />
					</Button>
					<input
						type="text"
						inputMode="numeric"
						pattern="[0-9]*"
						value={inputValue}
						onChange={handleInputChange}
						onBlur={handleInputBlur}
						aria-label="Number of servings"
						className="w-12 h-8 px-2 text-sm text-center font-medium border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-stone-950 dark:focus:ring-stone-300"
					/>
					<Button
						variant="outline"
						size="icon"
						onClick={increment}
						aria-label="Increase servings"
						className="h-8 w-8"
					>
						<Plus className="h-4 w-4" />
					</Button>
				</div>
			</div>

			{/* Per serving */}
			<div className="rounded-lg border border-stone-200 dark:border-stone-800 overflow-hidden">
				<div className="px-4 py-2 bg-stone-100 dark:bg-stone-800/50 text-xs font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400">
					Per serving
				</div>
				<div className="grid grid-cols-5 divide-x divide-stone-200 dark:divide-stone-800">
					<MacroCell value={macros.calories} label="kcal" />
					<MacroCell value={macros.protein} label="protein" suffix="g" />
					<MacroCell value={macros.carbs} label="carbs" suffix="g" />
					<MacroCell value={macros.fat} label="fat" suffix="g" />
					<MacroCell value={macros.fiber} label="fiber" suffix="g" />
				</div>
			</div>

			{/* Total */}
			<div
				className={`mt-3 rounded-lg border border-stone-200 dark:border-stone-800 overflow-hidden transition-all duration-300 ease-out ${
					servings === 1 ? 'max-h-0 opacity-0 mt-0 border-0' : 'max-h-[200px] opacity-100'
				}`}
			>
				<div className="px-4 py-2 bg-stone-100 dark:bg-stone-800/50 text-xs font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400">
					Total
				</div>
				<div className="grid grid-cols-5 divide-x divide-stone-200 dark:divide-stone-800">
					<MacroCell value={totalMacros.calories} label="kcal" />
					<MacroCell value={totalMacros.protein} label="protein" suffix="g" />
					<MacroCell value={totalMacros.carbs} label="carbs" suffix="g" />
					<MacroCell value={totalMacros.fat} label="fat" suffix="g" />
					<MacroCell value={totalMacros.fiber} label="fiber" suffix="g" />
				</div>
			</div>
		</div>
	);
}

function MacroCell({
	value,
	label,
	suffix,
}: {
	value: number;
	label: string;
	suffix?: string;
}) {
	return (
		<div className="px-2 py-3 text-center">
			<div className="text-lg font-bold">
				{value}
				{suffix && <span className="text-sm font-normal">{suffix}</span>}
			</div>
			<div className="text-[11px] text-stone-500 dark:text-stone-400">{label}</div>
		</div>
	);
}
