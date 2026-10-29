import { describe, expect, it } from 'vitest';
import { actionForKey } from '../../src/controls/keyboard';

const key = (k: string, mods: Partial<KeyboardEvent> = {}) => actionForKey({ key: k, ctrlKey: false, metaKey: false, altKey: false, ...mods });

describe('actionForKey', () => {
	it('toggles play with space and k', () => {
		expect(key(' ')).toEqual({ type: 'toggle-play' });
		expect(key('k')).toEqual({ type: 'toggle-play' });
		expect(key('K')).toEqual({ type: 'toggle-play' });
	});
	it('seeks 10s with j/l and 5s with arrows', () => {
		expect(key('j')).toEqual({ type: 'seek-by', seconds: -10 });
		expect(key('l')).toEqual({ type: 'seek-by', seconds: 10 });
		expect(key('ArrowLeft')).toEqual({ type: 'seek-by', seconds: -5 });
		expect(key('ArrowRight')).toEqual({ type: 'seek-by', seconds: 5 });
	});
	it('maps digits to tenths of the video', () => {
		expect(key('0')).toEqual({ type: 'seek-percent', percent: 0 });
		expect(key('5')).toEqual({ type: 'seek-percent', percent: 50 });
		expect(key('9')).toEqual({ type: 'seek-percent', percent: 90 });
	});
	it('handles volume, mute, full screen, captions, home and end', () => {
		expect(key('ArrowUp')).toEqual({ type: 'volume-by', delta: 0.1 });
		expect(key('ArrowDown')).toEqual({ type: 'volume-by', delta: -0.1 });
		expect(key('m')).toEqual({ type: 'toggle-mute' });
		expect(key('f')).toEqual({ type: 'toggle-fullscreen' });
		expect(key('c')).toEqual({ type: 'toggle-captions' });
		expect(key('Home')).toEqual({ type: 'seek-start' });
		expect(key('End')).toEqual({ type: 'seek-end' });
	});
	it('opens the menu and the shortcuts list', () => {
		expect(key('ContextMenu')).toEqual({ type: 'open-menu' });
		expect(key('F10', { shiftKey: true })).toEqual({ type: 'open-menu' });
		expect(key('F10')).toBeNull();
		expect(key('?', { shiftKey: true })).toEqual({ type: 'show-shortcuts' });
	});

	it('leaves other keys and browser shortcuts alone', () => {
		expect(key('x')).toBeNull();
		expect(key('Tab')).toBeNull();
		expect(key('f', { metaKey: true })).toBeNull();
		expect(key('l', { ctrlKey: true })).toBeNull();
		expect(key('ArrowLeft', { altKey: true })).toBeNull();
	});
});
