export type KeyAction =
	| { type: 'toggle-play' }
	| { type: 'seek-by'; seconds: number }
	| { type: 'seek-percent'; percent: number }
	| { type: 'volume-by'; delta: number }
	| { type: 'toggle-mute' }
	| { type: 'toggle-fullscreen' }
	| { type: 'toggle-captions' }
	| { type: 'seek-start' }
	| { type: 'seek-end' }
	| { type: 'show-shortcuts' }
	| { type: 'open-menu' };

/** Maps a keypress to a player action, or null when the key isn't ours. */
export function actionForKey(e: Pick<KeyboardEvent, 'key' | 'ctrlKey' | 'metaKey' | 'altKey'> & { shiftKey?: boolean }): KeyAction | null {
	if (e.ctrlKey || e.metaKey || e.altKey) return null;
	if (e.key == 'ContextMenu' || (e.shiftKey && e.key == 'F10')) return { type: 'open-menu' };
	if (e.key == '?') return { type: 'show-shortcuts' };
	const key = e.key.length == 1 ? e.key.toLowerCase() : e.key;
	if (/^[0-9]$/.test(key)) return { type: 'seek-percent', percent: Number(key) * 10 };
	switch (key) {
		case ' ':
		case 'k':
			return { type: 'toggle-play' };
		case 'j':
			return { type: 'seek-by', seconds: -10 };
		case 'l':
			return { type: 'seek-by', seconds: 10 };
		case 'ArrowLeft':
			return { type: 'seek-by', seconds: -5 };
		case 'ArrowRight':
			return { type: 'seek-by', seconds: 5 };
		case 'ArrowUp':
			return { type: 'volume-by', delta: 0.1 };
		case 'ArrowDown':
			return { type: 'volume-by', delta: -0.1 };
		case 'm':
			return { type: 'toggle-mute' };
		case 'f':
			return { type: 'toggle-fullscreen' };
		case 'c':
			return { type: 'toggle-captions' };
		case 'Home':
			return { type: 'seek-start' };
		case 'End':
			return { type: 'seek-end' };
	}
	return null;
}
