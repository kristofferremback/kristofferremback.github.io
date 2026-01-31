const VOLUME_TO_DL: Record<string, number> = {
	ml: 0.01,
	dl: 1,
	l: 10,
	tbsp: 0.15,
	tsp: 0.05,
	cup: 2.4,
};

function round(n: number): number {
	if (n >= 10) return Math.round(n);
	if (n >= 1) return Math.round(n * 10) / 10;
	return Math.round(n * 100) / 100;
}

function formatCups(cups: number): string {
	if (cups >= 0.9 && cups <= 1.1) return '~1 cup';
	if (cups >= 1.9 && cups <= 2.1) return '~2 cups';
	if (cups >= 0.45 && cups <= 0.55) return '~½ cup';
	if (cups >= 0.22 && cups <= 0.28) return '~¼ cup';
	if (cups >= 0.3 && cups <= 0.35) return '~⅓ cup';
	if (cups >= 0.65 && cups <= 0.7) return '~⅔ cup';
	if (cups >= 0.72 && cups <= 0.78) return '~¾ cup';
	return `~${round(cups)} cups`;
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

		if (unit !== 'dl' && dl >= 0.5) {
			alts.push(`${round(dl)} dl`);
		}
		if (unit !== 'ml' && unit !== 'dl' && dl < 1) {
			alts.push(`${round(dl * 100)} ml`);
		}

		const cups = dl / 2.4;
		if (cups >= 0.25) {
			alts.push(formatCups(cups));
		}
	}

	// Weight → volume (only if gPerDl available)
	if (unit === 'g' && gPerDl) {
		const dl = amount / gPerDl;
		if (dl >= 0.5) {
			alts.push(`~${round(dl)} dl`);
		}
	}

	return alts.length ? alts.join(', ') : null;
}
