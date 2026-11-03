import { QyroPlayer } from './player/element.js';

export { QyroPlayer, MEDIA_EVENTS, version } from './player/element.js';
export type { QualityChange, PlaylistItem, Chapter, ChapterChange } from './player/element.js';
export type { PlayerError, ErrorKind } from './engine/errors.js';
export type { Engine } from './engine/shaka.js';

if (typeof customElements !== 'undefined' && !customElements.get('qyro-player')) customElements.define('qyro-player', QyroPlayer);
