const VOLUME_TO_DL: Record<string, number> = {
	ml: 0.01,
	dl: 1,
	l: 10,
	tbsp: 0.15,
	tsp: 0.05,
	cup: 2.4,
};

// Common cooking fractions for friendly display
const COOKING_FRACTIONS = [
	{ value: 0.25, display: '¼' },
	{ value: 0.33, display: '⅓' },
	{ value: 0.5, display: '½' },
	{ value: 0.67, display: '⅔' },
	{ value: 0.75, display: '¾' },
	{ value: 1, display: '1' },
	{ value: 1.25, display: '1¼' },
	{ value: 1.33, display: '1⅓' },
	{ value: 1.5, display: '1½' },
	{ value: 1.67, display: '1⅔' },
	{ value: 1.75, display: '1¾' },
	{ value: 2, display: '2' },
	{ value: 2.5, display: '2½' },
	{ value: 3, display: '3' },
];

interface FractionResult {
	display: string;
	isExact: boolean;
}

function roundToFraction(n: number): FractionResult {
	const TOLERANCE = 0.01;

	// For values >= 4, just round to nearest 0.5
	if (n >= 4) {
		const rounded = Math.round(n * 2) / 2;
		const display = rounded % 1 === 0.5 ? `${Math.floor(rounded)}½` : String(rounded);
		return { display, isExact: Math.abs(n - rounded) < TOLERANCE };
	}

	// Find the closest cooking fraction
	let closest = COOKING_FRACTIONS[0];
	let minDiff = Math.abs(n - closest.value);

	for (const frac of COOKING_FRACTIONS) {
		const diff = Math.abs(n - frac.value);
		if (diff < minDiff) {
			minDiff = diff;
			closest = frac;
		}
	}

	return { display: closest.display, isExact: minDiff < TOLERANCE };
}

function formatCups(cups: number): string {
	const { display, isExact } = roundToFraction(cups);
	const isOne = display === '1';
	const prefix = isExact ? '' : '~';
	return `${prefix}${display} ${isOne ? 'cup' : 'cups'}`;
}

function formatDl(dl: number): string {
	const { display, isExact } = roundToFraction(dl);
	const prefix = isExact ? '' : '~';
	return `${prefix}${display} dl`;
}

export function getAlternatives(
	amount: number,
	unit: string,
	gPerDl?: number
): string | null {
	const alts: string[] = [];

	// Volume → other volumes
	if (unit in VOLUME_TO_DL) {
		const dl = amount * VOLUME_TO_DL[unit];

		if (unit !== 'dl' && dl >= 0.25) {
			alts.push(formatDl(dl));
		}

		const cups = dl / 2.4;
		if (cups >= 0.25) {
			alts.push(formatCups(cups));
		}
	}

	// Weight → volume (always approximate due to density variance)
	if (unit === 'g' && gPerDl) {
		const dl = amount / gPerDl;
		if (dl >= 0.25) {
			// Always use ~ for weight-to-volume since density varies
			const { display } = roundToFraction(dl);
			alts.push(`~${display} dl`);
		}
	}

	return alts.length ? alts.join(', ') : null;
}
