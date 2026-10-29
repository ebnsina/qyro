const VTT_TIME = /(?:(\d+):)?(\d{1,2}):(\d{2}(?:\.\d+)?)/;

/** Reads a WebVTT timestamp such as `01:02.500` or `1:00:02.500`; NaN when there is none. */
export function vttSeconds(s: string): number {
	const m = VTT_TIME.exec(s);
	if (!m) return NaN;
	return Number(m[1] ?? 0) * 3600 + Number(m[2]) * 60 + Number(m[3]);
}

const whole = (n: number) => (Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0);

/**
 * Formats seconds in the shape set by `scale` (usually the duration), so every time in one video
 * has the same length: m:ss under 10 minutes, mm:ss under an hour, h:mm:ss from an hour.
 * Bad input reads as zero.
 */
export function formatTime(seconds: number, scale = seconds): string {
	const s = whole(seconds);
	const ref = Math.max(whole(scale), s);
	const ss = String(s % 60).padStart(2, '0');
	if (ref >= 3600) {
		const hours = String(Math.floor(s / 3600)).padStart(String(Math.floor(ref / 3600)).length, '0');
		return `${hours}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${ss}`;
	}
	const m = String(Math.floor(s / 60));
	return `${ref >= 600 ? m.padStart(2, '0') : m}:${ss}`;
}

/** Width, in monospace characters, that fits any time for this scale plus a minus sign. */
export function timeWidth(scale: number): number {
	return formatTime(scale, scale).length + 1;
}

/** Spoken form for screen readers, e.g. "1 hour, 2 minutes, 5 seconds". */
export function speakTime(seconds: number): string {
	const s = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
	const parts: [number, string][] = [
		[Math.floor(s / 3600), 'hour'],
		[Math.floor((s % 3600) / 60), 'minute'],
		[s % 60, 'second'],
	];
	const said = parts.filter(([n], i) => n || (i == 2 && s < 60)).map(([n, u]) => `${n} ${u}${n == 1 ? '' : 's'}`);
	return said.join(', ');
}

/** Splits a `#t=90` start time off a URL, as "Copy URL at current time" writes it. */
export function splitStart(src: string): { src: string; start: number | null } {
	const m = /#t=(\d+(?:\.\d+)?)$/.exec(src);
	return m ? { src: src.slice(0, m.index), start: Number(m[1]) } : { src, start: null };
}

/** Adds `#t=<whole seconds>` to a URL, replacing any start time already on it. */
export function withStart(src: string, seconds: number): string {
	return `${splitStart(src).src}#t=${Math.floor(Math.max(0, seconds))}`;
}
