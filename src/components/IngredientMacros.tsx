import { useState, useEffect } from 'react';
import { Tooltip } from '@/components/ui/tooltip';

interface Macros {
	calories: number;
	protein: number;
	carbs: number;
	fat: number;
	fiber: number;
}

interface Props {
	macros: Macros;
	per100g?: Macros;
	baseServings: number;
	notes?: string;
}

function round(n: number): number {
	if (n >= 10) return Math.round(n);
	return Math.round(n * 10) / 10;
}

function scaleMacros(macros: Macros, ratio: number): Macros {
	return {
		calories: round(macros.calories * ratio),
		protein: round(macros.protein * ratio),
		carbs: round(macros.carbs * ratio),
		fat: round(macros.fat * ratio),
		fiber: round(macros.fiber * ratio),
	};
}

function MacroRow({ macros }: { macros: Macros }) {
	return (
		<div className="grid grid-cols-5 gap-x-2 px-3 py-2 text-center">
			<div>
				<div className="font-medium">{macros.calories}</div>
				<div className="text-[10px] opacity-60">kcal</div>
			</div>
			<div>
				<div className="font-medium">{macros.protein}g</div>
				<div className="text-[10px] opacity-60">protein</div>
			</div>
			<div>
				<div className="font-medium">{macros.carbs}g</div>
				<div className="text-[10px] opacity-60">carbs</div>
			</div>
			<div>
				<div className="font-medium">{macros.fat}g</div>
				<div className="text-[10px] opacity-60">fat</div>
			</div>
			<div>
				<div className="font-medium">{macros.fiber}g</div>
				<div className="text-[10px] opacity-60">fiber</div>
			</div>
		</div>
	);
}

function SectionHeader({ children }: { children: React.ReactNode }) {
	return (
		<div className="px-3 py-1.5 bg-black/10 dark:bg-white/10 text-[10px] font-medium uppercase tracking-wider opacity-70">
			{children}
		</div>
	);
}

export function IngredientMacros({ macros: baseMacros, per100g, baseServings, notes }: Props) {
	const [servings, setServings] = useState(baseServings);

	useEffect(() => {
		function handleUpdate(e: CustomEvent<{ servings: number }>) {
			setServings(e.detail.servings);
		}

		window.addEventListener('ingredients-update', handleUpdate as EventListener);
		return () => {
			window.removeEventListener('ingredients-update', handleUpdate as EventListener);
		};
	}, []);

	const ratio = servings / baseServings;
	const perServing = scaleMacros(baseMacros, 1 / servings);
	const total = scaleMacros(baseMacros, ratio);

	const tooltipContent = (
		<div className="min-w-[220px]">
			{per100g && (
				<>
					<SectionHeader>Per 100g</SectionHeader>
					<MacroRow macros={per100g} />
				</>
			)}

			<SectionHeader>Per serving</SectionHeader>
			<MacroRow macros={perServing} />

			{servings > 1 && (
				<>
					<SectionHeader>Full recipe ({servings} servings)</SectionHeader>
					<MacroRow macros={total} />
				</>
			)}

			{notes && (
				<div className="px-3 py-2 border-t border-black/10 dark:border-white/10 text-[11px] opacity-70 italic">
					{notes}
				</div>
			)}
		</div>
	);

	return (
		<Tooltip content={tooltipContent} contentClassName="text-xs p-0 overflow-hidden">
			<button
				type="button"
				className="inline-flex items-center justify-center w-4 h-4 text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300 transition-colors"
				aria-label="View nutritional info"
			>
				<svg
					className="w-3.5 h-3.5"
					fill="none"
					viewBox="0 0 24 24"
					strokeWidth="1.5"
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
					/>
				</svg>
			</button>
		</Tooltip>
	);
}
