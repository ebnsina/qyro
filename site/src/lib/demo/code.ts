// The code panel: the exact player for the playground's state, in each way people add Qyro.
import { CAPTIONS, chaptersOf, playerAttrs, themeVars, type State } from './state.js';

export type Tab = 'html' | 'js' | 'svelte' | 'react' | 'vue';

export const TABS: { id: Tab; label: string }[] = [
	{ id: 'html', label: 'HTML' },
	{ id: 'js', label: 'npm + JS' },
	{ id: 'svelte', label: 'Svelte' },
	{ id: 'react', label: 'React' },
	{ id: 'vue', label: 'Vue' },
];

const SCRIPT = 'https://cdn.jsdelivr.net/npm/qyro@0.1.0/dist/qyro.iife.js';

/** `origin` turns the site's own files (captions, storyboard, MP4) into full URLs people can copy. */
export function snippet(s: State, tab: Tab, origin = ''): string {
	const full = (p: string) => (p.startsWith('/') ? origin + p : p);
	const attrs = Object.entries(playerAttrs(s, full));
	const jsx = tab == 'react';
	const attr = ([k, v]: [string, string | true]) => (v === true ? k : `${k}="${v}"`);
	const chapters = chaptersOf(s);
	const end = jsx ? ' /' : '';
	const tracks = [
		s.captions && `<track kind="subtitles" srclang="en" label="English" src="${full(CAPTIONS)}" default${end}>`,
		chapters && `<track kind="chapters" src="${full(chapters)}"${end}>`,
	].filter(Boolean);
	const inner = tracks.length ? `${tracks.map((t) => `\n\t${t}`).join('')}\n` : '';
	const vars = themeVars(s.theme);
	const css = Object.keys(vars).length ? `qyro-player {\n${Object.entries(vars).map(([k, v]) => `\t${k}: ${v};`).join('\n')}\n}` : '';

	// Short attribute lists stay on one line; longer ones get a line each.
	const open = (indent = '') => {
		const parts = attrs.map(([k, v]) => (jsx && k == 'class' ? `className="${v}"` : attr([k, v])));
		const one = `<qyro-player ${parts.join(' ')}>`;
		if (one.length <= 72) return indent + one;
		return `${indent}<qyro-player\n${parts.map((p) => `${indent}\t${p}`).join('\n')}\n${indent}>`;
	};
	const element = (indent = '') => `${open(indent)}${inner.replace(/\n\t/g, `\n${indent}\t`).replace(/\n$/, `\n${indent}`)}</qyro-player>`;
	const style = (wrap: (c: string) => string) => (css ? `\n\n${wrap(css)}` : '');

	switch (tab) {
		case 'html':
			return `<script src="${SCRIPT}"></script>\n\n${element()}${style((c) => `<style>\n${indent(c)}\n</style>`)}`;
		case 'js': {
			const set = attrs.map(([k, v]) => `player.setAttribute('${k}', '${v === true ? '' : v}');`);
			const t =
				(s.captions
					? `\nconst track = Object.assign(document.createElement('track'), { kind: 'subtitles', srclang: 'en', label: 'English', src: '${full(CAPTIONS)}', default: true });\nplayer.append(track);`
					: '') + (chapters ? `\nplayer.append(Object.assign(document.createElement('track'), { kind: 'chapters', src: '${full(chapters)}' }));` : '');
			return `// npm install qyro\nimport 'qyro';\n\nconst player = document.createElement('qyro-player');\n${set.join('\n')}${t}\ndocument.querySelector('#video').append(player);${css ? `\n\n/* In your CSS */\n${css}` : ''}`;
		}
		case 'svelte':
			return `<script>\n\timport { onMount } from 'svelte';\n\tonMount(() => import('qyro'));\n</script>\n\n${element()}${style((c) => `<style>\n${indent(c.replace(/^qyro-player/, ':global(qyro-player)'))}\n</style>`)}`;
		case 'react':
			return `import { useEffect } from 'react';\n\nexport function Video() {\n\tuseEffect(() => {\n\t\timport('qyro');\n\t}, []);\n\treturn (\n${element('\t\t')}\n\t);\n}${css ? `\n\n/* In your CSS */\n${css}` : ''}`;
		case 'vue':
			return `<script setup>\nimport 'qyro';\n</script>\n\n<template>\n${element('\t')}\n</template>${style((c) => `<style>\n${indent(c)}\n</style>`)}`;
	}
}

const indent = (s: string) =>
	s
		.split('\n')
		.map((l) => `\t${l}`)
		.join('\n');
