export type ErrorKind = 'network' | 'offline' | 'not-found' | 'unsupported' | 'drm' | 'unknown';

export interface PlayerError {
	kind: ErrorKind;
	title: string;
	message: string;
	/** The engine's numeric error code, for developers; never shown to viewers. */
	code?: number;
	/** The raw error, for developers; never shown to viewers. */
	cause?: unknown;
}

/** The parts of shaka.util.Error this reads. */
export interface ShakaErrorLike {
	category?: number;
	code?: number;
	data?: unknown[];
}

const NETWORK = 1;
const MEDIA = 3;
const MANIFEST = 4;
const DRM = 6;
const BAD_HTTP_STATUS = 1001;
const UNSUPPORTED = new Set([3016, 4000, 4032, 4040]);

const COPY: Record<ErrorKind, Omit<PlayerError, 'kind' | 'code'>> = {
	offline: { title: "You're offline", message: 'Connect to the internet, then try again.' },
	network: { title: 'Check your connection', message: 'The video stopped loading. Check your connection, then try again.' },
	'not-found': { title: "This video can't play right now", message: 'It may have been moved or removed. Try again later.' },
	unsupported: { title: "This video format isn't supported on this device", message: 'Try another browser or device.' },
	drm: { title: "This video is protected and couldn't be unlocked", message: 'Try again, or use another browser or device.' },
	unknown: { title: "This video can't play right now", message: 'Something interrupted playback. Try again in a moment.' },
};

export function describeError(e: ShakaErrorLike | null | undefined, online = true): PlayerError {
	const kind = errorKind(e, online);
	return { kind, ...COPY[kind], code: e?.code };
}

function errorKind(e: ShakaErrorLike | null | undefined, online: boolean): ErrorKind {
	if (!online) return 'offline';
	if (!e) return 'unknown';
	if (e.category == DRM) return 'drm';
	if (e.code !== undefined && UNSUPPORTED.has(e.code)) return 'unsupported';
	if (e.code == BAD_HTTP_STATUS) {
		const status = e.data?.[1];
		return status == 404 || status == 410 ? 'not-found' : 'network';
	}
	if (e.category == NETWORK) return 'network';
	if (e.category == MEDIA || e.category == MANIFEST) return 'unsupported';
	return 'unknown';
}

/** For a plain <video> MediaError (no Shaka), e.g. when the browser itself fails to decode. */
export function describeMediaError(code: number | undefined, online = true): PlayerError {
	if (!online) return { kind: 'offline', ...COPY.offline };
	if (code == 2) return { kind: 'network', ...COPY.network };
	if (code == 3 || code == 4) return { kind: 'unsupported', ...COPY.unsupported };
	return { kind: 'unknown', ...COPY.unknown };
}
