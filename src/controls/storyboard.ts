/** One storyboard image: a whole picture, or a tile of a sprite when w and h are set. */
export interface Thumb {
	start: number;
	end: number;
	url: string;
	x: number;
	y: number;
	/** 0 when the image is used whole. */
	w: number;
	h: number;
}

const TIME = /(?:(\d+):)?(\d{1,2}):(\d{2}(?:\.\d+)?)/;

function seconds(s: string): number {
	const m = TIME.exec(s);
	if (!m) return NaN;
	return Number(m[1] ?? 0) * 3600 + Number(m[2]) * 60 + Number(m[3]);
}

/** Parses a WebVTT storyboard: each cue's text is an image URL, optionally `#xywh=x,y,w,h` into a sprite. */
export function parseStoryboard(vtt: string, base: string): Thumb[] {
	const list: Thumb[] = [];
	for (const block of vtt.replace(/\r/g, '').split(/\n{2,}/)) {
		const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
		const at = lines.findIndex((l) => l.includes('-->'));
		if (at < 0 || !lines[at + 1]) continue;
		const [from, to] = lines[at].split('-->');
		const [path, hash] = lines[at + 1].split('#');
		const xywh = /xywh=(?:pixel:)?(\d+),(\d+),(\d+),(\d+)/.exec(hash ?? '');
		const start = seconds(from);
		const end = seconds(to);
		if (!Number.isFinite(start) || !Number.isFinite(end)) continue;
		list.push({
			start,
			end,
			url: new URL(path, base).href,
			x: xywh ? Number(xywh[1]) : 0,
			y: xywh ? Number(xywh[2]) : 0,
			w: xywh ? Number(xywh[3]) : 0,
			h: xywh ? Number(xywh[4]) : 0,
		});
	}
	return list.sort((a, b) => a.start - b.start);
}

/** The thumbnail showing at `t`, by binary search; the nearest earlier one fills gaps. */
export function thumbAt(list: Thumb[], t: number): Thumb | null {
	let lo = 0;
	let hi = list.length - 1;
	let found: Thumb | null = null;
	while (lo <= hi) {
		const mid = (lo + hi) >> 1;
		if (list[mid].start <= t) {
			found = list[mid];
			lo = mid + 1;
		} else hi = mid - 1;
	}
	return found;
}
