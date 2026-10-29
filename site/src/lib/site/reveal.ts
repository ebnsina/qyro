import { inView } from '#lib/sinaui/ui/in-view.js';

/**
 * `{@attach reveal}`: fades and lifts a section (or each `[data-reveal-item]` in it, staggered)
 * the first time it scrolls into view. Without JavaScript nothing is hidden.
 */
export const reveal = (node: HTMLElement) => {
	node.classList.add('reveal-armed');
	return inView(() => node.classList.add('reveal-seen'), { threshold: 0.12 })(node);
};
