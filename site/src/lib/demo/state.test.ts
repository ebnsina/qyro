import { describe, expect, it } from 'vitest';
import { chaptersOf, initial, parse, playerAttrs, serialize, themeVars } from './state';
import { snippet, TABS } from './code';

const templates = ['standard', 'course', 'live', 'hero'];

describe('playground state', () => {
	it('round-trips through the URL, writing only what changed', () => {
		const s = initial('course');
		s.source = 'sintel';
		s.loop = true;
		s.theme.accent = '#ffd60a';
		const q = serialize(s);
		expect(q).toBe('?t=course&src=sintel&loop=1&accent=%23ffd60a');
		expect(parse(q, templates)).toEqual(s);
		expect(serialize(initial('live'))).toBe('?t=live');
	});

	it('keeps your own URL, and falls back to standard for unknown templates', () => {
		const s = parse('?t=nope&src=https%3A%2F%2Fcdn.test%2Fa.m3u8', templates);
		expect(s.t).toBe('standard');
		expect(s.source).toBe('custom');
		expect(playerAttrs(s).src).toBe('https://cdn.test/a.m3u8');
	});

	it('ignores bad values', () => {
		const s = parse('?accent=red&start=-4&radius=x', templates);
		expect(s.theme).toEqual(initial().theme);
		expect(s.start).toBe(0);
	});

	it('only offers thumbnails for the video they were made for', () => {
		const s = initial();
		expect(playerAttrs(s).thumbnails).toContain('storyboard.vtt');
		s.source = 'sintel';
		expect(playerAttrs(s).thumbnails).toBeUndefined();
	});

	it('writes only changed theme tokens', () => {
		expect(themeVars(initial().theme)).toEqual({});
		expect(themeVars({ ...initial().theme, tintAlpha: 50 })).toEqual({ '--qyro-glass-tint': 'rgb(28 28 32 / 0.5)' });
	});
});

describe('code panel', () => {
	it('shows the exact player, with no trailing blank lines, in every tab', () => {
		const s = initial('course');
		s.muted = true;
		for (const { id } of TABS) {
			const code = snippet(s, id, 'https://site.test');
			expect(code).not.toMatch(/\n\s*$/);
			expect(code).toContain('https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8');
			expect(code).toContain('https://site.test/media/captions.en.vtt');
			expect(code).not.toMatch(/shaka/i);
		}
		expect(snippet(s, 'html', 'https://site.test')).toContain('\n\tmuted\n');
	});

	it('gives the Course template its chapters track, only on the film they were made for', () => {
		const s = initial('course');
		expect(chaptersOf(s)).toBe('/media/bbb/chapters.vtt');
		expect(snippet(s, 'html', 'https://site.test')).toContain('<track kind="chapters" src="https://site.test/media/bbb/chapters.vtt">');
		expect(snippet(s, 'react', 'https://site.test')).toContain('<track kind="chapters" src="https://site.test/media/bbb/chapters.vtt" />');
		expect(snippet(s, 'js', 'https://site.test')).toContain("kind: 'chapters'");
		s.source = 'sintel';
		expect(chaptersOf(s)).toBeUndefined();
		expect(chaptersOf(initial('standard'))).toBeUndefined();
		expect(snippet(initial('standard'), 'html')).not.toContain('kind="chapters"');
	});

	it('adds CSS only when the theme changed', () => {
		const s = initial();
		expect(snippet(s, 'html')).not.toContain('<style>');
		s.theme.radius = 24;
		expect(snippet(s, 'html')).toContain('--qyro-radius: 24px;');
		expect(snippet(s, 'svelte')).toContain(':global(qyro-player)');
	});
	it('tint follows the accent when matchTint is on, and round-trips through the URL', () => {
		const theme = { ...initial().theme, accent: '#30d158', matchTint: true };
		expect(themeVars(theme)).toEqual({ '--qyro-accent': '#30d158', '--qyro-glass-tint': 'rgb(48 209 88 / 0.36)' });
		const url = serialize({ ...initial(), theme });
		expect(url).toContain('match-tint=1');
		expect(parse(url, ['standard']).theme).toMatchObject({ accent: '#30d158', matchTint: true });
	});
});
