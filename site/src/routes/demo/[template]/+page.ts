import { error } from '@sveltejs/kit';
import { templates } from '#lib/demo/templates.js';
import type { EntryGenerator, PageLoad } from './$types';

export const entries: EntryGenerator = () => templates.map((t) => ({ template: t.slug }));

export const load: PageLoad = ({ params }) => {
	const i = templates.findIndex((t) => t.slug == params.template);
	if (i < 0) error(404, 'There is no demo here.');
	return { index: i };
};
