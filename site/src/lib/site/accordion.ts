/**
 * `{@attach accordion}` on a `<details>`: the summary slides the body open and shut instead of snapping.
 * Reduced motion gets the instant toggle.
 */
export const accordion = (details: HTMLDetailsElement) => {
	const summary = details.querySelector('summary');
	if (!summary) return;
	const still = matchMedia('(prefers-reduced-motion: reduce)');
	const timing: KeyframeAnimationOptions = { duration: 260, easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)' };

	const onClick = (e: MouseEvent) => {
		e.preventDefault();
		if (details.dataset.busy) return;
		const from = details.offsetHeight;
		if (still.matches) {
			details.open = !details.open;
			return;
		}
		details.dataset.busy = '1';
		details.style.overflow = 'hidden';
		const done = () => {
			details.style.overflow = '';
			delete details.dataset.busy;
		};
		if (details.open) {
			details.animate({ height: [`${from}px`, `${summary.offsetHeight}px`] }, timing).onfinish = () => {
				details.open = false;
				done();
			};
		} else {
			details.open = true;
			details.animate({ height: [`${from}px`, `${details.offsetHeight}px`] }, timing).onfinish = done;
		}
	};

	summary.addEventListener('click', onClick);
	return () => summary.removeEventListener('click', onClick);
};
