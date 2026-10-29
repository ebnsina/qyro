import { afterEach, describe, expect, it, vi } from 'vitest';
import { chapterAt, loadChapters, parseChapters } from '../../src/controls/chapters';

const vtt = `WEBVTT

NOTE The opening scene runs long.

intro
00:00.000 --> 01:35.000
Opening: morning in the meadow

01:35.000 --> 03:25.000 align:start
Meet <b>Buck</b> &amp; friends

00:03:25.000 --> 00:06:00.000
The three
troublemakers

1:00:00.000 --> 1:02:30.500
Credits
`;

describe('parseChapters', () => {
	const list = parseChapters(vtt);

	it('reads cue timings, including hours and cue settings', () => {
		expect(list.map((c) => [c.start, c.end])).toEqual([
			[0, 95],
			[95, 205],
			[205, 360],
			[3600, 3750.5],
		]);
	});

	it('reads titles without tags or entities, joining lines', () => {
		expect(list.map((c) => c.title)).toEqual(['Opening: morning in the meadow', 'Meet Buck & friends', 'The three troublemakers', 'Credits']);
	});

	it('sorts by start and skips broken cues, empty titles and Windows line endings', () => {
		const messy = 'WEBVTT\r\n\r\n00:20.000 --> 00:30.000\r\nSecond\r\n\r\n00:10.000 --> 00:20.000\r\nFirst\r\n\r\nnot a cue\r\n\r\n00:40.000 --> 00:35.000\r\nBackwards\r\n\r\n00:50.000 --> 00:60.000\r\n\r\nxx --> yy\r\nNo times\r\n';
		expect(parseChapters(messy)).toEqual([
			{ start: 10, end: 20, title: 'First' },
			{ start: 20, end: 30, title: 'Second' },
		]);
	});

	it('gives no chapters for a WebVTT file without cues', () => {
		expect(parseChapters('WEBVTT')).toEqual([]);
		expect(parseChapters('﻿WEBVTT - chapters\n\n')).toEqual([]);
	});

	it('throws for an empty file or one that is not WebVTT', () => {
		expect(() => parseChapters('')).toThrow('not a WebVTT file');
		expect(() => parseChapters('<!doctype html><title>Not found</title>')).toThrow('not a WebVTT file');
		expect(() => parseChapters('WEBVTTX\n\n00:00.000 --> 00:01.000\nA')).toThrow('not a WebVTT file');
	});
});

describe('loadChapters', () => {
	afterEach(() => vi.unstubAllGlobals());

	it('resolves a relative URL against the base and reads the file', async () => {
		const fetch = vi.fn(async (_url: string) => new Response('WEBVTT\n\n00:00.000 --> 00:05.000\nOne'));
		vi.stubGlobal('fetch', fetch);
		expect(await loadChapters('chapters.vtt', 'https://site.test/media/bbb/page.html')).toEqual([{ start: 0, end: 5, title: 'One' }]);
		await loadChapters('/c.vtt', 'https://site.test/media/x/');
		await loadChapters('https://cdn.test/c.vtt', 'https://site.test/');
		expect(fetch.mock.calls.map((c) => c[0])).toEqual(['https://site.test/media/bbb/chapters.vtt', 'https://site.test/c.vtt', 'https://cdn.test/c.vtt']);
	});

	it('fails on an HTTP error', async () => {
		vi.stubGlobal('fetch', async () => new Response('Not found', { status: 404 }));
		await expect(loadChapters('missing.vtt', 'https://site.test/')).rejects.toThrow('HTTP 404');
	});
});

describe('chapterAt', () => {
	const list = [
		{ start: 5, end: 10, title: 'A' },
		{ start: 10, title: 'B' },
		{ start: 30, end: 40, title: 'C' },
		{ start: 50, end: 60, title: 'D' },
	];

	it('finds the chapter playing at a time', () => {
		expect(chapterAt(list, 5)).toBe(0);
		expect(chapterAt(list, 9.99)).toBe(0);
		expect(chapterAt(list, 10)).toBe(1);
		expect(chapterAt(list, 29)).toBe(1);
		expect(chapterAt(list, 35)).toBe(2);
		expect(chapterAt(list, 59)).toBe(3);
	});

	it('gives -1 before the first chapter, in a gap, after the last and with none', () => {
		expect(chapterAt(list, 0)).toBe(-1);
		expect(chapterAt(list, 45)).toBe(-1);
		expect(chapterAt(list, 60)).toBe(-1);
		expect(chapterAt([], 3)).toBe(-1);
	});
});
