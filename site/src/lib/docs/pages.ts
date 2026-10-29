// The docs: one Markdown file per page in src/docs. The site, the .md copies, llms.txt and the
// Qyro skill are all made from these files, so they can't drift apart.
const files = import.meta.glob('/src/docs/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

export interface Page {
	slug: string;
	title: string;
	description: string;
	/** The Markdown body, without the frontmatter. */
	body: string;
}

export const sections: { title: string; slugs: string[] }[] = [
	{ title: 'Start', slugs: ['getting-started', 'ai'] },
	{ title: 'Reference', slugs: ['attributes', 'api', 'events', 'theming'] },
	{ title: 'Guides', slugs: ['captions', 'thumbnails', 'chapters', 'live', 'analytics'] },
	{ title: 'More', slugs: ['accessibility', 'browser-support', 'faq'] },
];

function parse(slug: string, raw: string): Page {
	const m = /^---\n([\s\S]*?)\n---\n/.exec(raw);
	if (!m) throw new Error(`docs/${slug}.md has no frontmatter`);
	const meta = Object.fromEntries(m[1].split('\n').map((l) => [l.slice(0, l.indexOf(':')).trim(), l.slice(l.indexOf(':') + 1).trim()]));
	if (!meta.title || !meta.description) throw new Error(`docs/${slug}.md needs a title and a description`);
	return { slug, title: meta.title, description: meta.description, body: raw.slice(m[0].length).trim() + '\n' };
}

const bySlug = new Map(Object.entries(files).map(([path, raw]) => [path.split('/').pop()!.replace('.md', ''), raw]));

export const pages: Page[] = sections.flatMap((s) =>
	s.slugs.map((slug) => {
		const raw = bySlug.get(slug);
		if (!raw) throw new Error(`The docs sidebar lists ${slug}, but src/docs/${slug}.md is missing`);
		return parse(slug, raw);
	}),
);

const listed = new Set(pages.map((p) => p.slug));
for (const slug of bySlug.keys()) if (!listed.has(slug)) throw new Error(`src/docs/${slug}.md isn't in the docs sidebar`);

export const page = (slug: string) => pages.find((p) => p.slug == slug);
