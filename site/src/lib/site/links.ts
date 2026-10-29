import { asset, resolve } from '$app/paths';

// Every link goes through here, so the site works under a base path (BASE_PATH at build time).
export const to = (path: string) => resolve(path as '/');
export const file = (path: string) => asset(path.replace(/^\//, '') as never);

export const GITHUB = 'https://github.com/ebnsina/qyro';
// Where the site is served, without the base path (GitHub Pages until a deploy target is chosen).
export const SITE = 'https://ebnsina.github.io';

declare const __SITE_URL__: string;
/** The public site's full address for links read elsewhere (llms.txt, prompts); SITE_URL at build time. */
export const SITE_URL = __SITE_URL__;

export { media } from './media.js';
