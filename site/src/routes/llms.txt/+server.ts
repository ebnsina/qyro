import { resolve } from '$app/paths';
import { llms } from '#lib/docs/llms.js';

export const prerender = true;

export const GET = () => new Response(llms(resolve('/').replace(/\/$/, '')), { headers: { 'content-type': 'text/plain; charset=utf-8' } });
