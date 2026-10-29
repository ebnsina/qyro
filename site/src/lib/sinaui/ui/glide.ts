import { ease, reduced } from './motion';
/**
 * One highlight that glides to the active item (menus, listboxes, tabs, nav links) instead of each item
 * lighting up on its own. It moves and resizes with FLIP: jump to the final box, then animate a transform
 * from where it visually was, so only transform animates and an interrupted move continues smoothly.
 * Pointer moves glide; keyboard moves and first appearances snap. The highlight needs
 * `position: absolute; top: 0; left: 0; transform-origin: 0 0` and an opacity transition for fading.
 */
export function glide(
	highlight: HTMLElement,
	item: HTMLElement | null | undefined,
	animate: boolean,
	/** ms; hover-speed by default, longer for deliberate moves like changing page. */
	duration = 160
) {
	if (!item) {
		highlight.style.opacity = '0';
		return;
	}
	const appearing = highlight.style.opacity !== '1';
	const was = new DOMMatrix(getComputedStyle(highlight).transform);
	const from = {
		x: was.e,
		y: was.f,
		w: was.a * highlight.offsetWidth,
		h: was.d * highlight.offsetHeight
	};
	for (const a of highlight.getAnimations()) if (!(a instanceof CSSTransition)) a.cancel();

	const to = { x: item.offsetLeft, y: item.offsetTop, w: item.offsetWidth, h: item.offsetHeight };
	const end = `translate(${to.x}px, ${to.y}px)`;
	highlight.style.transform = end;
	highlight.style.inlineSize = `${to.w}px`;
	highlight.style.blockSize = `${to.h}px`;
	highlight.style.opacity = '1';

	if (!animate || appearing || !from.w || reduced()) return;
	highlight.animate(
		[
			{
				transform: `translate(${from.x}px, ${from.y}px) scale(${from.w / to.w}, ${from.h / to.h})`
			},
			{ transform: end }
		],
		{ duration, easing: ease.standard }
	);
}
