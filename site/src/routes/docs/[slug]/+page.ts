import { error } from '@sveltejs/kit';
import { pages, page } from '#lib/docs/pages.js';
import type { EntryGenerator, PageLoad } from './$types';

export const entries: EntryGenerator = () => pages.map((p) => ({ slug: p.slug }));

export const load: PageLoad = ({ params }) => {
	const p = page(params.slug);
	if (!p) error(404, 'There is no docs page here.');
	return { page: p };
};
