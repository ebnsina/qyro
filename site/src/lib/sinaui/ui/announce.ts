let region: HTMLElement | undefined;

/**
 * Says something to screen readers without moving focus, through one shared live region
 * (React Aria keeps a single global announcer for the same reason: several regions compete).
 */
export function announce(text: string, politeness: 'polite' | 'assertive' = 'polite') {
	if (!region?.isConnected) {
		region = document.createElement('div');
		region.style.cssText =
			'position:absolute;inline-size:1px;block-size:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap';
		document.body.append(region);
	}
	region.setAttribute('aria-live', politeness);
	// Cleared first, so saying the same thing twice is still announced.
	region.textContent = '';
	setTimeout(() => region && (region.textContent = text), 50);
}

/** VoiceOver (macOS and iOS) doesn't read aria-activedescendant changes; other screen readers do. */
export const isApple = () =>
	typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform);
