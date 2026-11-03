/** The fields of Shaka's track types this module reads, so tests can pass plain objects. */
export interface VariantTrack {
	id: number;
	active: boolean;
	bandwidth: number;
	width: number | null;
	height: number | null;
	frameRate: number | null;
	audioId: number | null;
	language: string;
}

export interface AudioTrack {
	active: boolean;
	language: string;
	label: string | null;
	channelsCount: number | null;
	roles: string[];
}

export interface TextTrack {
	id: number;
	active: boolean;
	language: string;
	label: string | null;
	kind: string | null;
	forced: boolean;
}

export interface Option<T = number> {
	value: T;
	label: string;
	badge?: string;
	active: boolean;
}

/** One entry per resolution for the audio track now playing, highest first. */
/**
 * The resolutions for the audio the viewer chose. Adaptive streaming can move to a track in another
 * audio group, so the list follows the choice, not the track playing; without a choice, it follows the
 * highest-bandwidth track, which doesn't change as the stream adapts.
 */
export function qualityOptions(tracks: VariantTrack[], audioId?: number | null): Option[] {
	const top = tracks.reduce<VariantTrack | undefined>((best, t) => (!best || t.bandwidth > best.bandwidth ? t : best), undefined);
	const chosen = audioId !== undefined && tracks.some((t) => t.audioId == audioId) ? audioId : top?.audioId;
	const sameAudio = tracks.filter((t) => t.audioId == chosen);
	const byHeight = new Map<string, VariantTrack>();
	for (const t of sameAudio) {
		if (!t.height) continue;
		const key = `${t.height}@${fps(t)}`;
		const seen = byHeight.get(key);
		// Keep the active track at a height, else the highest bitrate.
		if (!seen || (!seen.active && (t.active || t.bandwidth > seen.bandwidth))) byHeight.set(key, t);
	}
	return [...byHeight.values()]
		.sort((a, b) => b.height! - a.height! || fps(b) - fps(a) || b.bandwidth - a.bandwidth)
		.map((t) => ({ value: t.id, label: qualityLabel(t), badge: badge(t.height!), active: t.active }));
}

/** "1080p", "720p60". */
export function qualityLabel(t: Pick<VariantTrack, 'height' | 'frameRate'>): string {
	return t.height ? `${t.height}p${fps(t) > 30 ? Math.round(fps(t)) : ''}` : '';
}

function fps(t: Pick<VariantTrack, 'frameRate'>): number {
	return t.frameRate ?? 0;
}

function badge(height: number): string | undefined {
	if (height >= 2160) return '4K';
	if (height >= 720) return 'HD';
}

/** One entry per distinct language, label and channel layout; the value is the index in `tracks`. */
export function audioOptions(tracks: AudioTrack[], locale?: string): Option[] {
	const seen = new Map<string, Option>();
	tracks.forEach((t, i) => {
		// Unknown and stereo count as the same layout; Shaka reports both for one HLS rendition.
		const key = `${t.language}|${t.label ?? ''}|${channels(t.channelsCount) ?? ''}`;
		const known = seen.get(key);
		if (known) {
			if (t.active) Object.assign(known, { value: i, active: true });
			return;
		}
		seen.set(key, { value: i, label: t.label || languageName(t.language, locale), badge: channels(t.channelsCount), active: t.active });
	});
	return [...seen.values()];
}

function channels(n: number | null): string | undefined {
	if (!n || n <= 2) return;
	return n == 6 ? '5.1' : n == 8 ? '7.1' : `${n} ch`;
}

/** Text tracks plus "Off" (value -1), forced subtitles left out since they show on their own. */
export function captionOptions(tracks: TextTrack[], locale?: string): Option[] {
	const shown = tracks.filter((t) => !t.forced);
	const off: Option = { value: -1, label: 'Off', active: !shown.some((t) => t.active) };
	return [
		off,
		...shown.map((t) => ({
			value: t.id,
			label: t.label || languageName(t.language, locale),
			badge: t.kind == 'caption' || t.kind == 'captions' ? 'CC' : undefined,
			active: t.active,
		})),
	];
}

export function languageName(code: string, locale?: string): string {
	if (!code || code == 'und') return 'Unknown';
	try {
		return new Intl.DisplayNames(locale ? [locale] : undefined, { type: 'language' }).of(code) ?? code;
	} catch {
		return code;
	}
}

export const SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export function speedLabel(rate: number): string {
	return rate == 1 ? 'Normal' : `${rate}×`;
}
