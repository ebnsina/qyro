/** What "Stats for nerds" reads, gathered by the player so this stays a pure formatter. */
export interface StatsInput {
	width: number;
	height: number;
	frameRate: number | null;
	streamBandwidth: number;
	estimatedBandwidth: number;
	bufferAhead: number;
	droppedFrames: number;
	decodedFrames: number;
	codecs: string;
	live: boolean;
	liveLatency: number;
}

const NA = '—';

export function statRows(s: StatsInput, locale?: string): [string, string][] {
	const n = (v: number, digits = 0) => new Intl.NumberFormat(locale, { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(v);
	const rate = (bps: number) => (bps > 0 && Number.isFinite(bps) ? (bps >= 1e6 ? `${n(bps / 1e6, 2)} Mbps` : `${n(bps / 1e3)} kbps`) : NA);
	const dropped = s.decodedFrames > 0 ? `${n(s.droppedFrames)} of ${n(s.decodedFrames)} (${n((s.droppedFrames / s.decodedFrames) * 100, 1)}%)` : NA;
	const rows: [string, string][] = [
		['Resolution', s.width && s.height ? `${s.width}×${s.height}${s.frameRate ? ` at ${n(s.frameRate)} fps` : ''}` : NA],
		['Bitrate', rate(s.streamBandwidth)],
		['Connection speed', rate(s.estimatedBandwidth)],
		['Buffer', Number.isFinite(s.bufferAhead) ? `${n(Math.max(0, s.bufferAhead), 1)} s ahead` : NA],
		['Dropped frames', dropped],
		['Codec', s.codecs || NA],
	];
	if (s.live) rows.push(['Live delay', Number.isFinite(s.liveLatency) && s.liveLatency > 0 ? `${n(s.liveLatency, 1)} s` : NA]);
	return rows;
}

/** The shortcuts list, shown by the "Keyboard shortcuts" panel. One source for the panel and the docs. */
export const SHORTCUTS: [string, string][] = [
	['Space / K', 'Play or pause'],
	['J / L', 'Back or forward 10 seconds'],
	['← / →', 'Back or forward 5 seconds'],
	['↑ / ↓', 'Volume up or down'],
	['0 – 9', 'Jump to 0% – 90%'],
	['Home / End', 'Start or end (live: go to live)'],
	['M', 'Mute'],
	['C', 'Captions'],
	['F', 'Full screen'],
	['?', 'Show these shortcuts'],
	['Shift + F10', 'Player menu'],
];
