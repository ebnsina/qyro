import type { Settings, State } from './state.js';

/** The player as the playground's side content drives it. */
export type PlayerEl = HTMLElement & { play(): Promise<void>; seek(t: number): void; toggleFullscreen(): Promise<void>; muted: boolean; currentTime: number };

/** What each template's side content gets from the playground; read through getters so it stays live. */
export interface PlaygroundContext {
	readonly state: State;
	readonly player: PlayerEl | undefined;
	set(p: Partial<Settings>): void;
}
