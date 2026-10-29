// Theme switch with a spatial reveal: the new theme spreads in a circle from the control that changed it.
export function setTheme(dark: boolean, origin?: Element | null, update?: () => void) {
	// update runs inside the transition, so UI that depends on the theme lands in the new snapshot.
	const apply = () => {
		update?.();
		document.documentElement.dataset.theme = dark ? 'dark' : 'light';
		try {
			localStorage.setItem('theme', dark ? 'dark' : 'light');
		} catch {
			// Private mode or blocked storage: the choice just won't persist.
		}
	};
	if (!document.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) {
		apply();
		return;
	}
	const r = origin?.getBoundingClientRect();
	const x = r ? r.left + r.width / 2 : innerWidth / 2;
	const y = r ? r.top + r.height / 2 : innerHeight / 2;
	const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
	document.startViewTransition(apply).ready.then(() => {
		// Rare, deliberate action: 450ms is the delight budget, above the 300ms UI default.
		document.documentElement.animate(
			{ clipPath: [`circle(0 at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
			{
				duration: 450,
				easing: 'cubic-bezier(0.77, 0, 0.175, 1)',
				pseudoElement: '::view-transition-new(root)'
			}
		);
	});
}

export const isDark = () =>
	document.documentElement.dataset.theme
		? document.documentElement.dataset.theme === 'dark'
		: matchMedia('(prefers-color-scheme: dark)').matches;
