import { useState, useEffect, useRef } from 'react';

const AI_PROVIDERS = [
	{ id: 'claude', name: 'Claude', url: 'https://claude.ai/new?q={prompt}' },
	{ id: 'chatgpt', name: 'ChatGPT', url: 'https://chatgpt.com/?q={prompt}' },
	{ id: 't3chat', name: 'T3 Chat', url: 'https://t3.chat/new?q={prompt}' },
	{ id: 'perplexity', name: 'Perplexity', url: 'https://perplexity.ai/?q={prompt}' },
	{ id: 'gemini', name: 'Gemini', url: 'https://gemini.google.com/app?q={prompt}' },
] as const;

type ProviderId = (typeof AI_PROVIDERS)[number]['id'];

const STORAGE_KEY = 'preferred-ai-chat';

interface Props {
	recipeTitle: string;
	recipeId: string;
}

export function AIChatButton({ recipeTitle, recipeId }: Props) {
	const [selectedProvider, setSelectedProvider] = useState<ProviderId>('claude');
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored && AI_PROVIDERS.some((p) => p.id === stored)) {
			setSelectedProvider(stored as ProviderId);
		}
	}, []);

	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
				setIsOpen(false);
			}
		}

		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside);
			return () => document.removeEventListener('mousedown', handleClickOutside);
		}
	}, [isOpen]);

	const provider = AI_PROVIDERS.find((p) => p.id === selectedProvider) || AI_PROVIDERS[0];

	function buildUrl(): string {
		const origin = typeof window !== 'undefined' ? window.location.origin : '';
		const markdownUrl = `${origin}/ai/recipes/${recipeId}`;
		const prompt = `I have a recipe for "${recipeTitle}". Full recipe: ${markdownUrl}

Help me with this recipe - suggest ingredient swaps, convert units, scale portions, etc.`;

		return provider.url.replace('{prompt}', encodeURIComponent(prompt));
	}

	function handleProviderSelect(id: ProviderId) {
		setSelectedProvider(id);
		localStorage.setItem(STORAGE_KEY, id);
		setIsOpen(false);
	}

	function handleMainClick() {
		window.open(buildUrl(), '_blank', 'noopener,noreferrer');
	}

	return (
		<div ref={dropdownRef} className="relative inline-flex">
			<button
				type="button"
				onClick={handleMainClick}
				className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-l-md border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
			>
				<svg
					className="w-4 h-4"
					fill="none"
					viewBox="0 0 24 24"
					strokeWidth="1.5"
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
					/>
				</svg>
				Chat with {provider.name}
			</button>
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className="inline-flex items-center px-2 py-1.5 text-sm font-medium rounded-r-md border border-l-0 border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
				aria-haspopup="true"
				aria-expanded={isOpen}
			>
				<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
					<path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
				</svg>
			</button>

			{isOpen && (
				<div className="absolute right-0 bottom-full mb-1 w-40 rounded-md border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 shadow-lg z-50">
					<ul className="py-1">
						{AI_PROVIDERS.map((p) => (
							<li key={p.id}>
								<button
									type="button"
									onClick={() => handleProviderSelect(p.id)}
									className={`w-full text-left px-3 py-1.5 text-sm hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors ${
										p.id === selectedProvider
											? 'text-stone-900 dark:text-stone-100 font-medium'
											: 'text-stone-600 dark:text-stone-400'
									}`}
								>
									{p.name}
									{p.id === selectedProvider && (
										<svg
											className="inline w-4 h-4 ml-1.5"
											fill="none"
											viewBox="0 0 24 24"
											strokeWidth="2"
											stroke="currentColor"
										>
											<path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
										</svg>
									)}
								</button>
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
}
