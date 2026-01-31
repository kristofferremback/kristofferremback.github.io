import { useState, useEffect, useRef } from 'react';

const AI_PROVIDERS = [
	{ id: 'claude', name: 'Claude', url: 'https://claude.ai/new?q={prompt}' },
	{ id: 'chatgpt', name: 'ChatGPT', url: 'https://chatgpt.com/?q={prompt}' },
	{ id: 't3chat', name: 'T3 Chat', url: 'https://t3.chat/new?q={prompt}' },
	{ id: 'perplexity', name: 'Perplexity', url: 'https://perplexity.ai/?q={prompt}' },
	{ id: 'clipboard', name: 'Copy to clipboard', url: null },
] as const;

type ProviderId = (typeof AI_PROVIDERS)[number]['id'];

const STORAGE_KEY = 'preferred-ai-chat';

interface Props {
	recipeId: string;
	recipeMarkdown: string;
	recipeMarkdownShort: string;
}

const MAX_URL_LENGTH = 4000;

export function AIChatButton({ recipeId, recipeMarkdown, recipeMarkdownShort }: Props) {
	const [selectedProvider, setSelectedProvider] = useState<ProviderId>('claude');
	const [isOpen, setIsOpen] = useState(false);
	const [copied, setCopied] = useState(false);
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
	const isClipboard = provider.id === 'clipboard';

	function buildPrompt(short: boolean): string {
		const origin = typeof window !== 'undefined' ? window.location.origin : '';
		const recipeUrl = `${origin}/ai/recipes/${recipeId}`;
		const content = short ? recipeMarkdownShort : recipeMarkdown;

		return `Here's a recipe:

\`\`\`
${content}
\`\`\`

Full recipe: ${recipeUrl}`;
	}

	function buildUrl(): string {
		if (!provider.url) return '';

		const fullPrompt = buildPrompt(false);
		const fullUrl = provider.url.replace('{prompt}', encodeURIComponent(fullPrompt));

		if (fullUrl.length <= MAX_URL_LENGTH) {
			return fullUrl;
		}

		const shortPrompt = buildPrompt(true);
		return provider.url.replace('{prompt}', encodeURIComponent(shortPrompt));
	}

	function handleProviderSelect(id: ProviderId) {
		setSelectedProvider(id);
		localStorage.setItem(STORAGE_KEY, id);
		setIsOpen(false);
		setCopied(false);
	}

	async function handleMainClick() {
		if (isClipboard) {
			const prompt = buildPrompt(false);
			await navigator.clipboard.writeText(prompt);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} else {
			window.open(buildUrl(), '_blank', 'noopener,noreferrer');
		}
	}

	return (
		<div ref={dropdownRef} className="relative inline-flex">
			<button
				type="button"
				onClick={handleMainClick}
				className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-l-md border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
			>
				{isClipboard ? (
					<svg
						className="w-4 h-4"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth="1.5"
						stroke="currentColor"
					>
						{copied ? (
							<path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
						) : (
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184"
							/>
						)}
					</svg>
				) : (
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
				)}
				{isClipboard ? (copied ? 'Copied!' : 'Copy for AI') : `Chat with ${provider.name}`}
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
				<div className="absolute right-0 bottom-full mb-1 w-48 rounded-md border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 shadow-lg z-50">
					<ul className="py-1">
						{AI_PROVIDERS.map((p) => (
							<li key={p.id}>
								<button
									type="button"
									onClick={() => handleProviderSelect(p.id)}
									className={`w-full text-left px-3 py-1.5 text-sm hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors flex items-center justify-between gap-2 ${
										p.id === selectedProvider
											? 'text-stone-900 dark:text-stone-100 font-medium'
											: 'text-stone-600 dark:text-stone-400'
									}`}
								>
									<span>{p.name}</span>
									{p.id === selectedProvider && (
										<svg
											className="w-4 h-4 shrink-0"
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
