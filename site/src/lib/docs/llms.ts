import { pages, sections, page } from './pages';
import { SITE } from '#lib/site/links.js';

/** llms.txt in the llmstxt.org format: a title, a summary, and links to every page as Markdown. */
export function llms(base: string): string {
	const lines = ['# Qyro', '', '> A beautiful video player for any website: one <qyro-player> element that streams HLS, DASH, live and MP4 with captions, thumbnails, keyboard, touch and screen reader support in every browser, plus theming and optional private analytics.', ''];
	for (const s of sections) {
		lines.push(`## ${s.title}`, '');
		for (const slug of s.slugs) {
			const p = page(slug)!;
			lines.push(`- [${p.title}](${SITE}${base}/docs/${slug}.md): ${p.description}`);
		}
		lines.push('');
	}
	return lines.join('\n');
}

/** Every docs page in one file. */
export function llmsFull(): string {
	return ['# Qyro', '', ...pages.map((p) => p.body.replace(/^# .*\n/, `# ${p.title}\n`))].join('\n');
}
