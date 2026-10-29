import type { TextTrack } from '../engine/tracks.js';

/** What a viewer chose last time: no captions, their device's language, or a language code. */
export type CaptionChoice = 'off' | 'auto' | string;

export interface CaptionStyle {
	size: number;
	background: number;
	color: number;
}

// Viewer preferences in the FCC/WCAG caption model: size, background and text color.
export const CAPTION_SIZES = [
	{ label: 'Small', value: 0.75 },
	{ label: 'Medium', value: 1 },
	{ label: 'Large', value: 1.35 },
	{ label: 'Extra large', value: 1.75 },
];
export const CAPTION_BACKGROUNDS = [
	{ label: 'None', value: 'transparent' },
	{ label: 'Semi-transparent', value: 'rgb(0 0 0 / 0.6)' },
	{ label: 'Solid', value: 'rgb(0 0 0)' },
];
export const CAPTION_COLORS = [
	{ label: 'White', value: '#fff' },
	{ label: 'Yellow', value: '#ffe14d' },
];
export const DEFAULT_STYLE: CaptionStyle = { size: 1, background: 1, color: 0 };

/** The MIME type for a sideloaded caption file, from its extension. */
export function textMime(url: string): string | undefined {
	const ext = /\.([a-z0-9]+)(?:[?#]|$)/i.exec(url)?.[1]?.toLowerCase();
	return { vtt: 'text/vtt', webvtt: 'text/vtt', srt: 'text/srt', ttml: 'application/ttml+xml', dfxp: 'application/ttml+xml', xml: 'application/ttml+xml' }[ext ?? ''];
}

export function deviceLanguage(): string {
	return (navigator.language || 'en').split('-')[0].toLowerCase();
}

const base = (lang: string) => lang.split('-')[0].toLowerCase();

/** The device-language track, which the "Auto" option stands for. */
export function autoTrack(tracks: TextTrack[], lang = deviceLanguage()): TextTrack | undefined {
	return tracks.find((t) => !t.forced && base(t.language) == lang);
}

/**
 * Which track to show for a remembered choice: undefined means "leave the stream's default",
 * null means none.
 */
export function pickCaption(tracks: TextTrack[], choice: CaptionChoice | null, lang = deviceLanguage()): TextTrack | null | undefined {
	if (choice === null) return undefined;
	if (choice == 'off') return null;
	if (choice == 'auto') return autoTrack(tracks, lang) ?? null;
	return tracks.find((t) => !t.forced && base(t.language) == base(choice)) ?? undefined;
}

/** Remembered settings live in this browser only; private modes may refuse, which just means no memory. */
export const memory = {
	get(key: string): string | null {
		try {
			return localStorage.getItem(`qyro:${key}`);
		} catch {
			return null;
		}
	},
	set(key: string, value: string): void {
		try {
			localStorage.setItem(`qyro:${key}`, value);
		} catch {
			// Storage blocked: the choice still applies to this page.
		}
	},
};

export function readStyle(): CaptionStyle {
	try {
		return { ...DEFAULT_STYLE, ...JSON.parse(memory.get('caption-style') ?? '{}') };
	} catch {
		return DEFAULT_STYLE;
	}
}
