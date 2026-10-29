import { error } from '@sveltejs/kit';
import { pages, page } from '#lib/docs/pages.js';
import { expand } from '#lib/ai/ai.js';
import type { EntryGenerator, RequestHandler } from './$types';

export const prerender = true;
export const entries: EntryGenerator = () => pages.map((p) => ({ slug: p.slug }));

// The page's own Markdown, for people and for AI tools.
export const GET: RequestHandler = ({ params }) => {
	const p = page(params.slug);
	if (!p) error(404, 'There is no docs page here.');
	return new Response(expand(p.body), { headers: { 'content-type': 'text/markdown; charset=utf-8' } });
};
