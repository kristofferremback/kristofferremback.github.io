import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

import { cn } from '@/lib/utils';

function TooltipProvider({
	delayDuration = 0,
	...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
	return (
		<TooltipPrimitive.Provider
			data-slot="tooltip-provider"
			delayDuration={delayDuration}
			{...props}
		/>
	);
}

function TooltipTrigger({
	...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
	return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
	className,
	sideOffset = 4,
	children,
	...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
	return (
		<TooltipPrimitive.Portal>
			<TooltipPrimitive.Content
				data-slot="tooltip-content"
				sideOffset={sideOffset}
				className={cn(
					'bg-foreground text-background animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance',
					className
				)}
				{...props}
			>
				{children}
				<TooltipPrimitive.Arrow className="bg-foreground fill-foreground z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]" />
			</TooltipPrimitive.Content>
		</TooltipPrimitive.Portal>
	);
}

function useIsTouchDevice() {
	const [isTouch, setIsTouch] = React.useState(false);

	React.useEffect(() => {
		// Check for coarse pointer (touch) as primary input
		const mediaQuery = window.matchMedia('(pointer: coarse)');
		setIsTouch(mediaQuery.matches);

		const handler = (e: MediaQueryListEvent) => setIsTouch(e.matches);
		mediaQuery.addEventListener('change', handler);
		return () => mediaQuery.removeEventListener('change', handler);
	}, []);

	return isTouch;
}

interface TooltipProps {
	children: React.ReactNode;
	content: React.ReactNode;
	contentClassName?: string;
	side?: 'top' | 'right' | 'bottom' | 'left';
	align?: 'start' | 'center' | 'end';
	sideOffset?: number;
}

/**
 * Smart tooltip that works on both desktop (hover) and mobile (tap to toggle).
 * On touch devices, tap opens the tooltip and it stays open until:
 * - Tapped again on the trigger
 * - Tapped outside the tooltip
 * - Pressing Escape
 */
function Tooltip({
	children,
	content,
	contentClassName,
	side,
	align,
	sideOffset,
}: TooltipProps) {
	const isTouch = useIsTouchDevice();
	const [open, setOpen] = React.useState(false);
	const triggerRef = React.useRef<HTMLButtonElement>(null);

	const handleTriggerClick = React.useCallback(
		(e: React.MouseEvent | React.TouchEvent) => {
			if (isTouch) {
				e.preventDefault();
				setOpen((prev) => !prev);
			}
		},
		[isTouch]
	);

	// Close on outside click for touch devices
	React.useEffect(() => {
		if (!isTouch || !open) return;

		const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
			const target = e.target as Node;
			const tooltipContent = document.querySelector('[data-slot="tooltip-content"]');

			if (
				triggerRef.current &&
				!triggerRef.current.contains(target) &&
				tooltipContent &&
				!tooltipContent.contains(target)
			) {
				setOpen(false);
			}
		};

		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				setOpen(false);
			}
		};

		// Small delay to avoid closing immediately on the same tap that opened it
		const timeoutId = setTimeout(() => {
			document.addEventListener('touchstart', handleOutsideClick);
			document.addEventListener('mousedown', handleOutsideClick);
			document.addEventListener('keydown', handleEscape);
		}, 0);

		return () => {
			clearTimeout(timeoutId);
			document.removeEventListener('touchstart', handleOutsideClick);
			document.removeEventListener('mousedown', handleOutsideClick);
			document.removeEventListener('keydown', handleEscape);
		};
	}, [isTouch, open]);

	// For touch devices, we control the open state manually
	// For desktop, we let Radix handle hover naturally
	if (isTouch) {
		return (
			<TooltipProvider>
				<TooltipPrimitive.Root data-slot="tooltip" open={open} onOpenChange={setOpen}>
					<TooltipPrimitive.Trigger
						ref={triggerRef}
						data-slot="tooltip-trigger"
						asChild
						onClick={handleTriggerClick}
					>
						{children}
					</TooltipPrimitive.Trigger>
					<TooltipContent
						className={contentClassName}
						side={side}
						align={align}
						sideOffset={sideOffset}
						// Prevent tooltip from closing when interacting with its content
						onPointerDownOutside={(e) => {
							if (triggerRef.current?.contains(e.target as Node)) {
								e.preventDefault();
							}
						}}
					>
						{content}
					</TooltipContent>
				</TooltipPrimitive.Root>
			</TooltipProvider>
		);
	}

	// Desktop: standard hover behavior
	return (
		<TooltipProvider>
			<TooltipPrimitive.Root data-slot="tooltip">
				<TooltipPrimitive.Trigger data-slot="tooltip-trigger" asChild>
					{children}
				</TooltipPrimitive.Trigger>
				<TooltipContent
					className={contentClassName}
					side={side}
					align={align}
					sideOffset={sideOffset}
				>
					{content}
				</TooltipContent>
			</TooltipPrimitive.Root>
		</TooltipProvider>
	);
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
