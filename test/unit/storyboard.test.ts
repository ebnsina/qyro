import { describe, expect, it } from 'vitest';
import { parseStoryboard, thumbAt } from '../../src/controls/storyboard';

const vtt = `WEBVTT

1
00:00.000 --> 00:10.000
sprite.jpg#xywh=0,0,160,90

00:00:10.000 --> 00:00:20.000
sprite.jpg#xywh=160,0,160,90

00:20.000 --> 00:30.000
https://cdn.test/frames/3.jpg
`;

describe('parseStoryboard', () => {
	const list = parseStoryboard(vtt, 'https://site.test/media/thumbs.vtt');

	it('reads sprite tiles and resolves relative URLs against the VTT', () => {
		expect(list[0]).toEqual({ start: 0, end: 10, url: 'https://site.test/media/sprite.jpg', x: 0, y: 0, w: 160, h: 90 });
		expect(list[1]).toMatchObject({ start: 10, end: 20, x: 160, y: 0 });
	});

	it('reads whole images too', () => {
		expect(list[2]).toEqual({ start: 20, end: 30, url: 'https://cdn.test/frames/3.jpg', x: 0, y: 0, w: 0, h: 0 });
	});

	it('finds the cue for a time', () => {
		expect(thumbAt(list, 0)?.x).toBe(0);
		expect(thumbAt(list, 12.5)?.x).toBe(160);
		expect(thumbAt(list, 29)?.url).toContain('3.jpg');
		expect(thumbAt([], 3)).toBeNull();
	});

	it('skips broken cues and Windows line endings', () => {
		expect(parseStoryboard('WEBVTT\r\n\r\nnot a cue\r\n\r\n00:01.000 --> 00:02.000\r\na.jpg\r\n', 'https://x.test/').length).toBe(1);
		expect(parseStoryboard('WEBVTT', 'https://x.test/')).toEqual([]);
	});
});
