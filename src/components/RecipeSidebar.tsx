import { useEffect, useState, useCallback } from 'react';

interface Heading {
	depth: number;
	slug: string;
	text: string;
}

interface Ingredient {
	name: string;
	amount: number;
	unit: string;
}

interface Section {
	name: string;
	ingredients: Ingredient[];
}

type Ingredients = Ingredient[] | { sections: Section[] };

interface Props {
	headings: Heading[];
	ingredients: Ingredients;
	servings: number;
}

function cleanHeadingText(text: string): string {
	return text.replace(/^#\s*/, '');
}

function round(n: number): number {
	return Math.round(n * 10) / 10;
}

export function RecipeSidebar({ headings, ingredients, servings }: Props) {
	const tocHeadings = headings.filter((h) => h.depth >= 2 && h.depth <= 3);
	const isSectioned = 'sections' in ingredients;
	const flatIngredients = isSectioned
		? ingredients.sections.flatMap((s) => s.ingredients)
		: ingredients;

	const [activeId, setActiveId] = useState<string | null>(null);
	const [showBackToTop, setShowBackToTop] = useState(false);
	const [showIngredients, setShowIngredients] = useState(false);
	const [amounts, setAmounts] = useState<number[]>(flatIngredients.map((i) => i.amount));

	// TOC scroll spy
	useEffect(() => {
		if (tocHeadings.length === 0) return;

		const headingElements = tocHeadings
			.map((h) => document.getElementById(h.slug))
			.filter(Boolean) as HTMLElement[];

		if (headingElements.length === 0) return;

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						setActiveId(entry.target.id);
					}
				});
			},
			{ rootMargin: '-80px 0px -70% 0px', threshold: 0 }
		);

		headingElements.forEach((el) => observer.observe(el));

		// Set initial active
		if (window.location.hash) {
			setActiveId(window.location.hash.slice(1));
		} else if (headingElements[0]) {
			setActiveId(headingElements[0].id);
		}

		return () => observer.disconnect();
	}, [tocHeadings]);

	// Ingredients visibility (show when main list scrolls away)
	useEffect(() => {
		const ingredientsHeading = document.getElementById('ingredients-heading');
		if (!ingredientsHeading) return;

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					setShowIngredients(!entry.isIntersecting);
				});
			},
			{ rootMargin: '-100px 0px 0px 0px', threshold: 0 }
		);

		observer.observe(ingredientsHeading);
		return () => observer.disconnect();
	}, []);

	// Back to top visibility
	useEffect(() => {
		const handleScroll = () => setShowBackToTop(window.scrollY > 400);
		window.addEventListener('scroll', handleScroll, { passive: true });
		handleScroll();
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	// Sync with portion calculator
	useEffect(() => {
		const handleUpdate = (e: CustomEvent<{ amounts: number[] }>) => {
			setAmounts(e.detail.amounts);
		};
		window.addEventListener('ingredients-update', handleUpdate as EventListener);
		return () => window.removeEventListener('ingredients-update', handleUpdate as EventListener);
	}, []);

	const handleLinkClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, slug: string) => {
		e.preventDefault();
		const target = document.getElementById(slug);
		if (target) {
			target.scrollIntoView({ behavior: 'smooth', block: 'start' });
			history.pushState(null, '', `#${slug}`);
		}
	}, []);

	const handleBackToTop = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
		e.preventDefault();
		window.scrollTo({ top: 0, behavior: 'smooth' });
		history.pushState(null, '', window.location.pathname);
	}, []);

	return (
		<aside
			id="recipe-sidebar"
			className="hidden xl:block fixed top-0 right-0 h-screen w-56 pt-32 pr-8"
			aria-label="Recipe navigation"
		>
			<div className="sticky top-32 space-y-8">
				{/* Section navigation */}
				{tocHeadings.length > 0 && (
					<nav>
						<h2 className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-3">
							On this page
						</h2>
						<ul className="space-y-2 text-sm border-l border-stone-200 dark:border-stone-800">
							{tocHeadings.map((heading) => {
								const isActive = heading.slug === activeId;
								return (
									<li key={heading.slug}>
										<a
											href={`#${heading.slug}`}
											onClick={(e) => handleLinkClick(e, heading.slug)}
											className={`toc-link block py-1 transition-colors border-l -ml-px ${
												heading.depth === 3 ? 'pl-6' : 'pl-4'
											} ${
												isActive
													? 'text-stone-900 dark:text-stone-100 border-stone-900 dark:border-stone-100'
													: 'text-stone-400 dark:text-stone-500 border-transparent'
											}`}
										>
											{cleanHeadingText(heading.text)}
										</a>
									</li>
								);
							})}
						</ul>
					</nav>
				)}

				{/* Ingredients (fades in when main list scrolls away) */}
				<div
					className={`transition-opacity duration-300 ${
						showIngredients ? 'opacity-100' : 'opacity-0 pointer-events-none'
					}`}
				>
					<h2 className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-3">
						Ingredients
					</h2>
					<ul className="text-sm border-l border-stone-200 dark:border-stone-800 pl-4 space-y-1.5 max-h-[40vh] overflow-y-auto">
						{flatIngredients.map((ingredient, i) => (
							<li key={`${ingredient.name}-${i}`} className="flex items-center justify-between gap-2">
								<span className="text-stone-600 dark:text-stone-400 truncate">
									{ingredient.name}
								</span>
								<span className="text-stone-500 dark:text-stone-500 tabular-nums whitespace-nowrap">
									{round(amounts[i] ?? ingredient.amount)} {ingredient.unit}
								</span>
							</li>
						))}
					</ul>
				</div>

				{/* Back to top */}
				<a
					href="#"
					onClick={handleBackToTop}
					className={`block text-sm text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 transition-colors ${
						showBackToTop ? 'opacity-100' : 'opacity-0 pointer-events-none'
					}`}
					aria-label="Back to top"
				>
					↑ Back to top
				</a>
			</div>
		</aside>
	);
}
