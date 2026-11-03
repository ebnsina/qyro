let keyboard = false;
let listening = false;

/**
 * Focuses `el` for a mouse or touch open without the focus style: the player host gets `data-pointer`,
 * which the stylesheet reads. A key press clears it everywhere, so keyboard users keep the ring.
 */
export function focusQuietly(el: HTMLElement | null | undefined): void {
	if (!listening) {
		listening = true;
		document.addEventListener(
			'keydown',
			() => {
				keyboard = true;
				document.querySelectorAll('[data-pointer]').forEach((h) => h.removeAttribute('data-pointer'));
			},
			true,
		);
		document.addEventListener('pointerdown', () => (keyboard = false), true);
	}
	const host = (el?.getRootNode() as ShadowRoot | undefined)?.host;
	host?.toggleAttribute('data-pointer', !keyboard);
	// A pointer open must not scroll the sheet to the focused row: the page header would scroll out of view.
	el?.focus({ preventScroll: !keyboard });
}
