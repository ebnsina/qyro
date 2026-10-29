import { describe, expect, it } from 'vitest';
import { statRows, type StatsInput } from '../../src/controls/stats';

const base: StatsInput = {
	width: 1280,
	height: 720,
	frameRate: 30,
	streamBandwidth: 2_450_000,
	estimatedBandwidth: 812_000,
	bufferAhead: 12.34,
	droppedFrames: 3,
	decodedFrames: 600,
	codecs: 'avc1.4d401f,mp4a.40.2',
	live: false,
	liveLatency: NaN,
};

describe('statRows', () => {
	it('uses plain labels and never names the engine', () => {
		expect(JSON.stringify(statRows(base, 'en-US'))).not.toMatch(/shaka/i);
	});

	it('formats every row for an on-demand stream', () => {
		expect(Object.fromEntries(statRows(base, 'en-US'))).toEqual({
			Resolution: '1280×720 at 30 fps',
			Bitrate: '2.45 Mbps',
			'Connection speed': '812 kbps',
			Buffer: '12.3 s ahead',
			'Dropped frames': '3 of 600 (0.5%)',
			Codec: 'avc1.4d401f,mp4a.40.2',
		});
	});

	it('adds the live delay for live streams and dashes for unknowns', () => {
		const rows = Object.fromEntries(statRows({ ...base, live: true, liveLatency: 4.2, width: 0, height: 0, streamBandwidth: NaN, decodedFrames: 0 }, 'en-US'));
		expect(rows['Live delay']).toBe('4.2 s');
		expect(rows.Resolution).toBe('—');
		expect(rows.Bitrate).toBe('—');
		expect(rows['Dropped frames']).toBe('—');
	});
});
