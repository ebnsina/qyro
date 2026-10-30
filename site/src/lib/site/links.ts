import { asset, resolve } from '$app/paths';

// Every link goes through here, so the site works under a base path (BASE_PATH at build time).
export const to = (path: string) => resolve(path as '/');
export const file = (path: string) => asset(path as never);

export const GITHUB = 'https://github.com/ebnsina/qyro';
// Where the site is served, without the base path (GitHub Pages until a deploy target is chosen).
export const SITE = 'https://ebnsina.github.io';

export { media } from './media.js';
