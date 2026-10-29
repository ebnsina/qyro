import { describe, expect, it } from 'vitest';
import { autoTrack, pickCaption, textMime } from '../../src/controls/captions';

const t = (id: number, language: string, forced = false) => ({ id, active: false, language, label: null, kind: 'subtitle', forced });
const tracks = [t(1, 'en'), t(2, 'es-419'), t(3, 'fr', true)];

describe('captions', () => {
	it('knows caption file types by extension', () => {
		expect(textMime('/a/b.vtt')).toBe('text/vtt');
		expect(textMime('/a/b.SRT?x=1')).toBe('text/srt');
		expect(textMime('/a/b.ttml')).toBe('application/ttml+xml');
		expect(textMime('/a/b')).toBeUndefined();
	});

	it('offers Auto only when the device language has a track', () => {
		expect(autoTrack(tracks, 'es')?.id).toBe(2);
		expect(autoTrack(tracks, 'fr')).toBeUndefined();
		expect(autoTrack(tracks, 'de')).toBeUndefined();
	});

	it('restores a remembered choice', () => {
		expect(pickCaption(tracks, null, 'en')).toBeUndefined();
		expect(pickCaption(tracks, 'off', 'en')).toBeNull();
		expect(pickCaption(tracks, 'auto', 'es')?.id).toBe(2);
		expect(pickCaption(tracks, 'auto', 'de')).toBeNull();
		expect(pickCaption(tracks, 'es', 'en')?.id).toBe(2);
		expect(pickCaption(tracks, 'ja', 'en')).toBeUndefined();
	});
});
