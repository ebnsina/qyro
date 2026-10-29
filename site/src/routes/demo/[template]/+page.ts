import { error } from '@sveltejs/kit';
import { templates } from '#lib/demo/templates.js';
import type { EntryGenerator, PageLoad } from './$types';

export const entries: EntryGenerator = () => templates.map((t) => ({ template: t.slug }));

export const load: PageLoad = ({ params }) => {
	if (!templates.some((t) => t.slug == params.template)) error(404, 'There is no demo here.');
	return { slug: params.template };
};
