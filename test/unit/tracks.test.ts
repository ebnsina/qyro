import { describe, expect, it } from 'vitest';
import { audioOptions, captionOptions, qualityOptions, type VariantTrack } from '../../src/engine/tracks';

let id = 0;
const v = (height: number | null, bandwidth: number, extra: Partial<VariantTrack> = {}): VariantTrack => ({
	id: id++,
	active: false,
	bandwidth,
	width: height ? Math.round((height * 16) / 9) : null,
	height,
	frameRate: 30,
	audioId: 1,
	language: 'en',
	...extra,
});

describe('qualityOptions', () => {
	it('lists one entry per height, highest first, with badges', () => {
		const tracks = [v(360, 400e3), v(1080, 5e6), v(720, 2.5e6, { active: true }), v(2160, 15e6)];
		const list = qualityOptions(tracks);
		expect(list.map((o) => o.label)).toEqual(['2160p', '1080p', '720p', '360p']);
		expect(list.map((o) => o.badge)).toEqual(['4K', 'HD', 'HD', undefined]);
		expect(list.find((o) => o.active)?.label).toBe('720p');
	});

	it('lists the resolutions of the audio the viewer chose, not the one playing', () => {
		const tracks = [v(720, 2e6, { audioId: 1, active: true }), v(720, 2.1e6, { audioId: 2 }), v(480, 1e6, { audioId: 2 })];
		expect(qualityOptions(tracks, 2).map((o) => o.label)).toEqual(['720p', '480p']);
	});

	it('stays the same when adaptive streaming moves to a track in another audio group', () => {
		const before = [v(720, 2.1e6, { audioId: 2, active: true }), v(480, 1e6, { audioId: 2 }), v(360, 500e3, { audioId: 3 })];
		const after = before.map((t) => ({ ...t, active: t.audioId == 3 && t.height == 360 }));
		expect(qualityOptions(after, 2).map((o) => o.label)).toEqual(qualityOptions(before, 2).map((o) => o.label));
		expect(qualityOptions(after, 2).map((o) => o.label)).toEqual(['720p', '480p']);
	});

	it('without a choice, lists the audio of the highest-bandwidth track', () => {
		const tracks = [v(720, 2e6, { audioId: 1, active: true }), v(720, 2.1e6, { audioId: 2 }), v(480, 1e6, { audioId: 2 })];
		expect(qualityOptions(tracks).map((o) => o.label)).toEqual(['720p', '480p']);
	});

	it('picks the highest bitrate at a height unless another is active', () => {
		const low = v(720, 1e6);
		const high = v(720, 3e6);
		expect(qualityOptions([low, high])[0].value).toBe(high.id);
		const active = v(720, 1e6, { active: true });
		expect(qualityOptions([active, v(720, 3e6)])[0].value).toBe(active.id);
	});

	it('shows high frame rates and keeps them apart', () => {
		const list = qualityOptions([v(1080, 5e6), v(1080, 8e6, { frameRate: 59.94 })]);
		expect(list.map((o) => o.label)).toEqual(['1080p60', '1080p']);
	});

	it('is empty for audio-only and empty streams', () => {
		expect(qualityOptions([v(null, 128e3)])).toEqual([]);
		expect(qualityOptions([])).toEqual([]);
	});
});

describe('audioOptions', () => {
	const a = (language: string, extra = {}) => ({ active: false, language, label: null, channelsCount: 2, roles: [], ...extra });

	it('names languages and marks surround sound', () => {
		const list = audioOptions([a('en', { active: true }), a('fr', { channelsCount: 6 })], 'en');
		expect(list).toEqual([
			{ value: 0, label: 'English', badge: undefined, active: true },
			{ value: 1, label: 'French', badge: '5.1', active: false },
		]);
	});

	it('merges duplicates and keeps the active one', () => {
		const list = audioOptions([a('und', { channelsCount: null }), a('und', { active: true }), a('und')], 'en');
		expect(list).toEqual([{ value: 1, label: 'Unknown', badge: undefined, active: true }]);
	});
});

describe('captionOptions', () => {
	const t = (tid: number, language: string, extra = {}) => ({ id: tid, active: false, language, label: null, kind: 'subtitle', forced: false, ...extra });

	it('starts with Off, active when nothing is selected', () => {
		const list = captionOptions([t(1, 'en'), t(2, 'es', { label: 'Español' })], 'en');
		expect(list.map((o) => [o.label, o.active])).toEqual([
			['Off', true],
			['English', false],
			['Español', false],
		]);
	});

	it('leaves out forced subtitles and badges closed captions', () => {
		const list = captionOptions([t(1, 'en', { kind: 'caption', active: true }), t(2, 'en', { forced: true })], 'en');
		expect(list.map((o) => o.label)).toEqual(['Off', 'English']);
		expect(list[0].active).toBe(false);
		expect(list[1].badge).toBe('CC');
	});
});
