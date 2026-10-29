/** Hue 0–360, saturation and brightness 0–1: the space the picker's area and slider move in. */
export interface Hsv {
	h: number;
	s: number;
	v: number;
}

export function hsvToHex({ h, s, v }: Hsv) {
	const f = (n: number) => {
		const k = (n + h / 60) % 6;
		return v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
	};
	return (
		'#' +
		[f(5), f(3), f(1)]
			.map((c) =>
				Math.round(c * 255)
					.toString(16)
					.padStart(2, '0')
			)
			.join('')
	);
}

/** Reads #rgb or #rrggbb (the # optional); undefined for anything else. */
export function hexToHsv(hex: string): Hsv | undefined {
	let m = hex.trim().replace(/^#/, '').toLowerCase();
	if (/^[0-9a-f]{3}$/.test(m)) m = [...m].map((c) => c + c).join('');
	if (!/^[0-9a-f]{6}$/.test(m)) return undefined;
	const [r, g, b] = [0, 2, 4].map((i) => parseInt(m.slice(i, i + 2), 16) / 255);
	const max = Math.max(r, g, b);
	const d = max - Math.min(r, g, b);
	const h =
		d === 0 ? 0 : max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
	return { h: (h * 60 + 360) % 360, s: max ? d / max : 0, v: max };
}

/** Plain words for a color ("dark green"), so a screen reader says more than numbers. */
export function colorName({ h, s, v }: Hsv) {
	if (v < 0.12) return 'black';
	// Near black, color fades out sooner: #292d33 is a gray, not a blue.
	if (s < 0.1 || (s < 0.25 && v < 0.35))
		return v > 0.92 ? 'white' : v > 0.6 ? 'light gray' : v > 0.3 ? 'gray' : 'dark gray';
	const hues: [number, string][] = [
		[15, 'red'],
		[40, 'orange'],
		[65, 'yellow'],
		[170, 'green'],
		[200, 'cyan'],
		[255, 'blue'],
		[290, 'purple'],
		[335, 'pink'],
		[360, 'red']
	];
	const hue = hues.find(([end]) => h < end)![1];
	const tone = v < 0.45 ? 'dark ' : v > 0.85 && s < 0.45 ? 'light ' : s < 0.35 ? 'grayish ' : '';
	return tone + hue;
}
