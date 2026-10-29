// Run after the site build: the AI files must exist and cover every docs page, and no page may
// name the playback engine (only the licence notice may).
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const build = new URL('../site/build/', import.meta.url).pathname;
const slugs = readdirSync(new URL('../site/src/docs/', import.meta.url)).filter((f) => f.endsWith('.md')).map((f) => f.slice(0, -3));
const fail = (msg) => {
	console.error(`check-site: ${msg}`);
	process.exitCode = 1;
};

for (const f of ['llms.txt', 'llms-full.txt']) if (!existsSync(join(build, f))) fail(`${f} is missing`);
const index = existsSync(join(build, 'llms.txt')) ? readFileSync(join(build, 'llms.txt'), 'utf8') : '';
const full = existsSync(join(build, 'llms-full.txt')) ? readFileSync(join(build, 'llms-full.txt'), 'utf8') : '';
for (const slug of slugs) {
	if (!existsSync(join(build, 'docs', `${slug}.md`))) fail(`docs/${slug}.md is missing from the build`);
	if (!index.includes(`/docs/${slug}.md`)) fail(`llms.txt doesn't link docs/${slug}.md`);
	const title = /^title: (.*)$/m.exec(readFileSync(new URL(`../site/src/docs/${slug}.md`, import.meta.url), 'utf8'))?.[1];
	if (!full.includes(`# ${title}`)) fail(`llms-full.txt is missing "${title}"`);
}

// Visible text only: page HTML and Markdown, not the minified JavaScript.
const walk = (dir) => readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? (f == '_app' ? [] : walk(join(dir, f))) : [join(dir, f)]));
for (const file of walk(build).filter((f) => /\.(html|md|txt)$/.test(f))) {
	const text = readFileSync(file, 'utf8').replace(/<script[\s\S]*?<\/script>/g, '');
	if (/shaka/i.test(text)) fail(`${file.replace(build, '')} mentions the playback engine by name`);
}

if (!process.exitCode) console.log(`check-site: ${slugs.length} docs pages, llms.txt and llms-full.txt are complete`);
