// The one source for "Use with AI": where each tool reads skills, and the prompts people copy.
// The docs page, its Markdown copy, llms-full.txt and the landing page all read from here.
import { SITE } from '#lib/site/links.js';
import { resolve } from '$app/paths';

const site = () => SITE + resolve('/').replace(/\/$/, '');
const SKILL = 'https://github.com/ebnsina/qyro/blob/main/skills/qyro/SKILL.md';
const copy = (dir: string) => `mkdir -p ${dir} && cp -r node_modules/qyro/skills/qyro ${dir}/`;

export interface Tool {
	id: string;
	name: string;
	/** simple-icons key for the brand mark; tools without a usable mark get a Hugeicons glyph. */
	mark?: 'claude' | 'cursor' | 'copilot' | 'gemini' | 'windsurf';
	/** Where skills go, from the tool's own docs. */
	where: string;
	command: string;
	note: string;
	docs: string;
}

export const tools: Tool[] = [
	{ id: 'claude', name: 'Claude Code', mark: 'claude', where: '.claude/skills/qyro/', command: copy('.claude/skills'), note: 'For every project, copy it to ~/.claude/skills/ instead.', docs: 'https://code.claude.com/docs/en/skills' },
	{ id: 'codex', name: 'Codex', where: '.agents/skills/qyro/', command: copy('.agents/skills'), note: 'For every project, copy it to ~/.agents/skills/ instead.', docs: 'https://learn.chatgpt.com/docs/build-skills' },
	{ id: 'cursor', name: 'Cursor', mark: 'cursor', where: '.cursor/skills/qyro/', command: copy('.cursor/skills'), note: 'Cursor also reads .agents/skills/, and ~/.cursor/skills/ for every project.', docs: 'https://cursor.com/docs/skills' },
	{ id: 'copilot', name: 'GitHub Copilot', mark: 'copilot', where: '.github/skills/qyro/', command: copy('.github/skills'), note: 'For every project, copy it to ~/.copilot/skills/ instead.', docs: 'https://docs.github.com/en/copilot/concepts/agents/about-agent-skills' },
	{ id: 'gemini', name: 'Gemini CLI', mark: 'gemini', where: '.gemini/skills/qyro/', command: copy('.gemini/skills'), note: 'Run /skills list in Gemini CLI to check it was found.', docs: 'https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/skills.md' },
	{ id: 'windsurf', name: 'Windsurf', mark: 'windsurf', where: '.devin/skills/qyro/', command: copy('.devin/skills'), note: 'Older Windsurf builds read .windsurf/skills/; for every project use ~/.codeium/windsurf/skills/.', docs: 'https://docs.devin.ai/desktop/cascade/skills' },
	{ id: 'other', name: 'Any other AI', where: 'AGENTS.md or the chat', command: 'curl -s https://raw.githubusercontent.com/ebnsina/qyro/main/skills/qyro/SKILL.md >> AGENTS.md', note: 'Or paste the skill, or the llms-full.txt link, into the chat.', docs: 'https://agents.md' },
];

export interface Prompt {
	id: string;
	title: string;
	summary: string;
	task: string;
	verify: string[];
}

export const prompts: Prompt[] = [
	{
		id: 'add',
		title: 'Add a player',
		summary: 'Put a Qyro player on a page with a poster and a title.',
		task: 'Add a Qyro video player to this project playing <VIDEO URL> with a poster image and the title "<TITLE>". Put it where it fits the existing layout.',
		verify: ['The page loads with no console errors and shows the poster and a round play button.', 'Pressing play starts the video and the controls appear.', 'With the player focused, Space, the arrow keys and F work.'],
	},
	{
		id: 'theme',
		title: 'Theme it to my brand',
		summary: 'Match colors, corners and fonts using only --qyro-* tokens and ::part().',
		task: "Theme our Qyro players to match the brand: accent <COLOR>, corner radius <PX>, our body and monospace fonts. Find the brand values in the project's existing CSS or design tokens first.",
		verify: ['Only --qyro-* custom properties and ::part() rules were added, in the project\'s global styles.', 'The seek bar, volume and focus rings use the accent, and text stays readable over bright and dark frames.'],
	},
	{
		id: 'captions',
		title: 'Add captions and thumbnails',
		summary: 'Sideload subtitles in several languages and a storyboard for the seek preview.',
		task: 'Add captions to our Qyro player from <EN.VTT> (English, on by default) and <ES.SRT> (Spanish), and storyboard thumbnails from <STORYBOARD.VTT>. If there is no storyboard yet, make one with ffmpeg the way the Qyro thumbnails docs describe.',
		verify: ['The CC button shows and turns captions on and off; Settings → Captions lists both languages.', 'Hovering the seek bar shows a thumbnail with the time.', 'The caption and storyboard files load with no CORS errors.'],
	},
	{
		id: 'live',
		title: 'Set up a live stream',
		summary: 'Muted autoplay, the LIVE badge, and a message when the stream ends.',
		task: 'Set up a Qyro player for our live stream <LIVE URL>: muted autoplay, plays inline on phones, and the LIVE badge. Show our own "Starting soon" text above it until the stream plays.',
		verify: ['The LIVE badge is red at the live edge.', 'Seeking back turns it grey with "Go live", and clicking it returns to the edge.', 'Nothing about the stream is hard-coded except its URL.'],
	},
	{
		id: 'analytics',
		title: 'Turn on Seyr analytics',
		summary: 'Private video analytics on your own Seyr server, with a stable id per video.',
		task: 'Turn on Seyr video analytics for our Qyro players with seyr-key "<KEY>" and seyr-host "<SEYR URL>". Give every video a stable video-id from our data (not its URL), plus title and series where we have them.',
		verify: ['Each player has seyr-key, seyr-host and a unique video-id.', 'Playing a video sends requests to <SEYR URL>/api/video, and nothing else new is loaded.'],
	},
	{
		id: 'migrate',
		title: 'Move from Video.js, Plyr or YouTube',
		summary: 'Replace an existing player or embed with Qyro, keeping its features.',
		task: 'Replace our existing video player (Video.js, Plyr, or YouTube/Vimeo iframes) with Qyro. Keep the same sources, posters, captions and any event handling, and remove the old player\'s scripts and styles.',
		verify: ['No traces of the old player remain in the dependencies, imports, scripts or CSS.', 'Every page that had a video still plays it, with its captions and posters.', 'Event handlers now listen on <qyro-player> (play, pause, ended, timeupdate, error).'],
	},
];

/** The complete prompt behind "Copy full prompt": the task, where to read, the rules, and how to check. */
export function fullPrompt(p: Prompt): string {
	return [
		p.task,
		'',
		'Use Qyro, a video player web component (npm package "qyro", element <qyro-player>). Read these first:',
		`- The Qyro skill: ${SKILL}`,
		`- Docs index: ${site()}/llms.txt`,
		`- Every docs page in one file: ${site()}/llms-full.txt`,
		'',
		'Rules:',
		"- Detect this project's framework and package manager and follow its conventions. With no build step, use Qyro's script tag.",
		"- Use only Qyro's attributes, methods, events, --qyro-* tokens and ::part() hooks. Don't reach into its internals, its engine, or a bare <video>.",
		'- Keep it accessible: a title on every player, captions where there is speech, and no autoplay with sound.',
		'',
		'When you are done, check:',
		...p.verify.map((v) => `- ${v}`),
		'- Then tell me what you changed and how you checked it.',
	].join('\n');
}

/** The same content as Markdown, for the docs page's .md copy and llms-full.txt. */
export function toolsMarkdown(): string {
	return tools.map((t) => `### ${t.name}\n\nPut the skill in \`${t.where}\`:\n\n\`\`\`shell\n${t.command}\n\`\`\`\n\n${t.note} Docs: ${t.docs}`).join('\n\n');
}

export function promptsMarkdown(): string {
	return prompts.map((p) => `### ${p.title}\n\n${p.summary}\n\n\`\`\`text\n${fullPrompt(p)}\n\`\`\``).join('\n\n');
}

/** Swaps the interactive placeholders in a docs page for their Markdown. */
export function expand(body: string): string {
	return body.replace('<!-- ai:tools -->', toolsMarkdown()).replace('<!-- ai:prompts -->', promptsMarkdown());
}
