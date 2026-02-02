import { useState, useEffect } from 'react';
import { Tooltip } from '@/components/ui/tooltip';
import { getAlternatives } from '@/lib/conversions';

interface Props {
	amount: number;
	unit: string;
	gPerDl?: number;
	index: number;
}

function round(n: number): number {
	return Math.round(n * 10) / 10;
}

export function IngredientAmount({ amount: initialAmount, unit, gPerDl, index }: Props) {
	const [amount, setAmount] = useState(initialAmount);

	useEffect(() => {
		function handleUpdate(e: CustomEvent<{ amounts: number[] }>) {
			const newAmount = e.detail.amounts[index];
			if (newAmount !== undefined) {
				setAmount(newAmount);
			}
		}

		window.addEventListener('ingredients-update', handleUpdate as EventListener);
		return () => {
			window.removeEventListener('ingredients-update', handleUpdate as EventListener);
		};
	}, [index]);

	const alternatives = getAlternatives(amount, unit, gPerDl);

	if (!alternatives) {
		return (
			<span className="text-sm text-stone-600 dark:text-stone-400 tabular-nums">
				<span className="ingredient-amount font-medium">{round(amount)}</span> {unit}
			</span>
		);
	}

	return (
		<Tooltip content={alternatives}>
			<span className="text-sm text-stone-600 dark:text-stone-400 tabular-nums cursor-help">
				<span className="ingredient-amount font-medium border-b border-dotted border-stone-400 dark:border-stone-500">
					{round(amount)}
				</span>{' '}
				{unit}
			</span>
		</Tooltip>
	);
}
