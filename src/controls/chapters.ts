import { vttSeconds } from './time.js';

/** One chapter of a video. Without `end`, it runs until the next one starts. */
export interface Chapter {
	/** Seconds. */
	start: number;
	end?: number;
	title: string;
}

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', nbsp: ' ', quot: '"', apos: "'" };

/** Reads a WebVTT chapters file: each cue is a chapter, its text the title. Throws when it isn't WebVTT. */
export function parseChapters(vtt: string): Chapter[] {
	const text = vtt.replace(/^﻿/, '').replace(/\r\n?/g, '\n');
	if (!/^WEBVTT(?:[ \t]|\n|$)/.test(text)) throw new Error('not a WebVTT file');
	const list: Chapter[] = [];
	for (const block of text.split(/\n{2,}/)) {
		const lines = block.split('\n').map((l) => l.trim());
		const at = lines.findIndex((l) => l.includes('-->'));
		if (at < 0) continue;
		const [from, to] = lines[at].split('-->');
		const start = vttSeconds(from);
		const end = vttSeconds(to);
		const title = lines
			.slice(at + 1)
			.join(' ')
			.replace(/<[^>]*>/g, '')
			.replace(/&(amp|lt|gt|nbsp|quot|apos);/g, (_, e: string) => ENTITIES[e])
			.trim();
		if (!Number.isFinite(start) || !(end > start) || !title) continue;
		list.push({ start, end, title });
	}
	return list.sort((a, b) => a.start - b.start);
}

/** Fetches and reads a chapters file; a relative `url` is read from `base`. */
export async function loadChapters(url: string, base: string): Promise<Chapter[]> {
	const res = await fetch(new URL(url, base).href);
	if (!res.ok) throw new Error(`HTTP ${res.status}`);
	return parseChapters(await res.text());
}

/** Index of the chapter playing at `t` in a list sorted by start, or -1 before the first or in a gap. */
export function chapterAt(list: readonly Chapter[], t: number): number {
	let i = -1;
	while (i + 1 < list.length && list[i + 1].start <= t) i++;
	const c = list[i];
	return c && c.end !== undefined && t >= c.end ? -1 : i;
}
