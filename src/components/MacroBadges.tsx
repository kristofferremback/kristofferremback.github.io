import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface Macros {
	calories: number;
	protein: number;
	carbs: number;
	fat: number;
	fiber: number;
}

interface Props {
	macros: Macros;
}

const badges = [
	{ key: 'calories', label: 'kcal', tooltip: (v: number) => `${v} kcal per serving` },
	{ key: 'protein', label: 'P', tooltip: (v: number) => `${v}g protein per serving` },
	{ key: 'carbs', label: 'C', tooltip: (v: number) => `${v}g carbs per serving` },
	{ key: 'fat', label: 'F', tooltip: (v: number) => `${v}g fat per serving` },
	{ key: 'fiber', label: 'Fi', tooltip: (v: number) => `${v}g fiber per serving` },
] as const;

export default function MacroBadges({ macros }: Props) {
	return (
		<div className="flex gap-px text-xs">
			{badges.map(({ key, label, tooltip }, i) => {
				const value = macros[key];
				const isFirst = i === 0;
				const isLast = i === badges.length - 1;

				return (
					<Tooltip key={key}>
						<TooltipTrigger asChild>
							<span
								className={`px-2 py-1 bg-stone-100 dark:bg-stone-800 font-medium cursor-default ${isFirst ? 'rounded-l-md' : ''} ${isLast ? 'rounded-r-md' : ''}`}
							>
								{value}
								<span className="ml-0.5 font-normal text-stone-500 dark:text-stone-400">
									{label}
								</span>
							</span>
						</TooltipTrigger>
						<TooltipContent>{tooltip(value)}</TooltipContent>
					</Tooltip>
				);
			})}
		</div>
	);
}
