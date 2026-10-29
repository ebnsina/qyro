import { ease, reduced } from './motion';

export type Side = 'top' | 'bottom' | 'left' | 'right';

const opposite: Record<Side, Side> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };

/**
 * Positions a top-layer element (popover) beside its anchor. Prefers `side` and flips to the opposite
 * side when only that one fits; left/right drop below when neither fits. Above/below it aligns to the
 * anchor's start edge (or its end near the viewport edge; RTL mirrors both) or its center; left/right
 * it centers vertically. Always stays 8px
 * inside the viewport. Sets transform-origin to the point facing the anchor so scale animations grow out
 * of it, and exposes that point as --anchor-x / --anchor-y plus data-side for arrows.
 * Returns the side used, or null once the anchor has scrolled off-screen.
 */
export function place(
	anchor: HTMLElement,
	el: HTMLElement,
	{
		side = 'bottom',
		align = 'start',
		gap = 6
	}: { side?: Side; align?: 'start' | 'center' | 'top'; gap?: number } = {}
): Side | null {
	const t = anchor.getBoundingClientRect();
	// Layout size, not getBoundingClientRect: an in-flight scale animation must not skew placement.
	const m = { width: el.offsetWidth, height: el.offsetHeight };
	const edge = 8;
	const vw = document.documentElement.clientWidth;
	const vh = innerHeight;
	if (t.bottom < 0 || t.top > vh || t.right < 0 || t.left > vw) return null;

	const room: Record<Side, number> = {
		top: t.top - gap - edge,
		bottom: vh - t.bottom - gap - edge,
		left: t.left - gap - edge,
		right: vw - t.right - gap - edge
	};
	const needed = side === 'top' || side === 'bottom' ? m.height : m.width;
	let s = needed > room[side] && room[opposite[side]] > room[side] ? opposite[side] : side;
	// Too wide for either side (a submenu on a phone): drop below its item, or above, rather than cover it.
	if ((s === 'left' || s === 'right') && m.width > room[s])
		s = room.bottom >= m.height || room.bottom >= room.top ? 'bottom' : 'top';
	const clamp = (n: number, max: number) => Math.min(Math.max(edge, n), max - edge);

	let x: number;
	let y: number;
	if (s === 'top' || s === 'bottom') {
		if (align === 'center') x = t.left + t.width / 2 - m.width / 2;
		else {
			const rtl = getComputedStyle(anchor).direction === 'rtl';
			const start = rtl ? t.right - m.width : t.left;
			const end = rtl ? t.left : t.right - m.width;
			const fits = (n: number) => n >= edge && n + m.width <= vw - edge;
			// Neither edge fits (a phone): center on the anchor rather than pin to one side.
			x = fits(start) ? start : fits(end) ? end : t.left + t.width / 2 - m.width / 2;
		}
		y = s === 'top' ? t.top - gap - m.height : t.bottom + gap;
	} else {
		x = s === 'left' ? t.left - gap - m.width : t.right + gap;
		// top: its first row lines up with the anchor (a submenu beside its item); otherwise centered.
		y =
			align === 'top'
				? t.top - (parseFloat(getComputedStyle(el).paddingTop) || 0) - el.clientTop
				: t.top + t.height / 2 - m.height / 2;
	}
	x = clamp(x, vw - m.width);
	y = clamp(y, vh - m.height);
	el.style.left = `${x}px`;
	el.style.top = `${y}px`;

	// Where the anchor's center falls on the element: the scale origin, and where an arrow should point.
	const ax = Math.min(Math.max(0, t.left + t.width / 2 - x), m.width);
	const ay = Math.min(Math.max(0, t.top + t.height / 2 - y), m.height);
	const origin = {
		top: `${ax}px ${m.height}px`,
		bottom: `${ax}px 0`,
		left: `${m.width}px ${ay}px`,
		right: `0 ${ay}px`
	};
	el.style.transformOrigin = origin[s];
	el.style.setProperty('--anchor-x', `${ax}px`);
	el.style.setProperty('--anchor-y', `${ay}px`);
	el.dataset.side = s;
	return s;
}

type PlaceOptions = {
	side?: Side;
	align?: 'start' | 'center' | 'top';
	gap?: number;
};

/** The rows inside a panel that stagger in: visible children, not aria-hidden decoration. */
const rows = (e: HTMLElement) =>
	[...e.children].filter((c): c is HTMLElement => !c.hasAttribute('aria-hidden')).slice(0, 12);

/**
 * Shows and hides a top-layer element beside its anchor: grows out of it (transform + opacity only, so it
 * stays smooth on a busy page), follows scroll/resize, and calls onDismiss for an outside press or when the
 * anchor leaves the screen. Closing mid-open plays it backwards; reopening mid-close turns it around.
 */
export function anchored(
	anchor: () => HTMLElement,
	el: () => HTMLElement,
	onDismiss: () => void,
	options: PlaceOptions = {}
) {
	let anim: Animation | undefined;
	let contentAnims: Animation[] = [];
	let closing = false;
	let stop: (() => void) | undefined;

	return {
		/** Returns the side it opened on. */
		open(): Side {
			const a = anchor();
			const e = el();
			const reopening = anim?.playState === 'running' && closing;
			if (!e.matches(':popover-open')) e.showPopover();
			const side = place(a, e, options) ?? options.side ?? 'bottom';
			const reduce = reduced();
			if (reopening && anim) {
				// Turned around mid-close: it heads back out from wherever it is.
				anim.onfinish = null;
				anim.reverse();
				for (const c of contentAnims) c.reverse();
				closing = false;
			} else {
				anim?.cancel();
				for (const c of contentAnims) c.cancel();
				contentAnims = [];
				closing = false;
				if (reduce) {
					anim = e.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150, fill: 'both' });
				} else {
					// Rises 6px toward its anchor and settles from 94% on a spring; its rows follow a beat apart.
					const [x, y] = { top: [0, 6], bottom: [0, -6], left: [6, 0], right: [-6, 0] }[side];
					anim = e.animate(
						[
							{ opacity: 0, translate: `${x}px ${y}px`, scale: 0.94 },
							{ opacity: 1, offset: 0.3 },
							{ opacity: 1, translate: '0 0', scale: 1 }
						],
						{ duration: 220, easing: ease.standard, fill: 'both' }
					);
					// Decorative layers (a hover highlight) keep their own opacity.
					contentAnims = rows(e).map((c, i) =>
						c.animate([{ opacity: 0, translate: `${x / 2}px ${y / 2}px` }, {}], {
							duration: 240,
							delay: 40 + Math.min(i, 8) * 20,
							easing: ease.enter,
							fill: 'backwards'
						})
					);
				}
			}

			stop?.();
			// Dismissed by a press that starts AND ends outside (React Aria's useInteractOutside): a touch
			// that turns into a scroll ends in pointercancel, not click, so scrolling the page never closes it.
			let pressedOutside = false;
			const down = (ev: PointerEvent) => {
				const t = ev.target as Node;
				pressedOutside = !e.contains(t) && !a.contains(t);
			};
			const outside = () => {
				if (!pressedOutside) return;
				pressedOutside = false;
				onDismiss();
				// Pressing empty page moved focus to <body>: put keyboard users back on the trigger.
				const f = document.activeElement;
				if (!f || f === document.body || e.contains(f)) a.focus({ preventScroll: true });
			};
			const follow = () => place(a, e, options) ?? onDismiss();
			document.addEventListener('pointerdown', down, true);
			document.addEventListener('click', outside, true);
			addEventListener('resize', follow);
			addEventListener('scroll', follow, true);
			// Content that changes size while open (a filtered list) is re-placed: above, it stays against the anchor.
			// Only re-places: it also fires once on observing, which must never close what just opened.
			const resized = new ResizeObserver(() => place(a, e, options));
			resized.observe(e);
			stop = () => {
				resized.disconnect();
				document.removeEventListener('pointerdown', down, true);
				document.removeEventListener('click', outside, true);
				removeEventListener('resize', follow);
				removeEventListener('scroll', follow, true);
			};
			return side;
		},
		/** instant: gone at once, no fade (a menu bar swapping one menu for the next). */
		close(instant = false) {
			stop?.();
			stop = undefined;
			const e = el();
			if (!e.matches(':popover-open')) return;
			if (instant || !anim) {
				anim?.cancel();
				for (const c of contentAnims) c.cancel();
				e.hidePopover();
				return;
			}
			// Mid-open: back the way it came. Settled: a short fade that shrinks 3% toward the anchor.
			closing = true;
			const hide = () => {
				closing = false;
				e.hidePopover();
			};
			for (const c of contentAnims) c.cancel();
			contentAnims = [];
			if (anim.playState === 'running') {
				anim.onfinish = hide;
				anim.reverse();
				anim.updatePlaybackRate(-2);
			} else {
				anim.cancel();
				anim = e.animate([{}, { opacity: 0, scale: 0.97 }], {
					duration: 130,
					easing: ease.standard,
					fill: 'both'
				});
				anim.onfinish = hide;
			}
		},
		/** Unmounting mid-close: cancel, so the finish callback never touches a removed element. */
		destroy() {
			stop?.();
			anim?.cancel();
		}
	};
}
