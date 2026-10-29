import { Marked, type Token, type Tokens } from 'marked';
import { to } from '#lib/site/links.js';
import type { Lang } from '#lib/sinaui/ui/CodeBlock.svelte';

export type Block = { kind: 'html'; html: string } | { kind: 'code'; code: string; lang: Lang } | { kind: 'preview'; name: string };

const LANGS: Record<string, Lang> = { shell: 'shell', sh: 'shell', html: 'html', js: 'js', ts: 'ts', tsx: 'ts', css: 'css', svelte: 'svelte', vue: 'html', json: 'json', text: 'shell' };

const slug = (s: string) =>
	s
		.toLowerCase()
		.replace(/<[^>]+>/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');

const marked = new Marked({
	renderer: {
		heading({ tokens, depth }) {
			const text = this.parser.parseInline(tokens);
			return depth == 1 ? `<h1>${text}</h1>` : `<h${depth} id="${slug(text)}">${text}</h${depth}>`;
		},
		link({ href, tokens }) {
			const text = this.parser.parseInline(tokens);
			const internal = href.startsWith('/');
			return `<a href="${internal ? to(href) : href}"${internal ? '' : ' rel="noopener"'}>${text}</a>`;
		},
	},
});

/** Splits a docs page into prose (HTML), code blocks (drawn with CodeBlock) and live previews. */
export function blocks(body: string): Block[] {
	const out: Block[] = [];
	let run: Token[] = [];
	const flush = () => {
		if (run.length) out.push({ kind: 'html', html: marked.parser(run as Token[]) });
		run = [];
	};
	const tokens = marked.lexer(body);
	for (const t of tokens) {
		const preview = t.type == 'html' && /<!-- preview:(\w+) -->/.exec((t as Tokens.HTML).raw);
		if (t.type == 'code') {
			flush();
			const lang = LANGS[(t as Tokens.Code).lang ?? ''] ?? 'shell';
			out.push({ kind: 'code', code: (t as Tokens.Code).text, lang });
		} else if (preview) {
			flush();
			out.push({ kind: 'preview', name: preview[1] });
		} else run.push(t);
	}
	flush();
	return out;
}
