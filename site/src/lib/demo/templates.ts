import type { Component } from 'svelte';
import Article from './Article.svelte';
import Cinema from './Cinema.svelte';
import Course from './Course.svelte';
import Hero from './Hero.svelte';
import Live from './Live.svelte';
import Playlist from './Playlist.svelte';
import Product from './Product.svelte';
import Standard from './Standard.svelte';
import Theming from './Theming.svelte';
import Vertical from './Vertical.svelte';
import { media } from '#lib/site/links.js';

export interface Template {
	slug: string;
	title: string;
	description: string;
	component: Component;
	/** The markup to copy: what a site writes to get this player. */
	code: string;
}

const bbb = `src="${media.bbb.hls}"\n  poster="${media.bbb.poster}"`;

export const templates: Template[] = [
	{ slug: 'standard', title: 'Standard', description: 'A plain embed with poster, title and storyboard thumbnails.', component: Standard, code: `<qyro-player\n  ${bbb}\n  title="Big Buck Bunny"\n  thumbnails="/media/bbb/storyboard.vtt"\n></qyro-player>` },
	{ slug: 'cinema', title: 'Cinema', description: 'Full-bleed and dark, in 21:9, with square corners.', component: Cinema, code: `<qyro-player\n  src="${media.sintel.hls}"\n  title="Sintel"\n  style="--qyro-radius: 0; --qyro-aspect-ratio: 21 / 9"\n></qyro-player>` },
	{ slug: 'hero', title: 'Marketing hero', description: 'A muted loop behind a headline, with a Watch action.', component: Hero, code: `<qyro-player src="${media.tos.hls}" autoplay muted loop class="hero-video"></qyro-player>\n\n<style>\n  .hero-video::part(controls),\n  .hero-video::part(big-play-button),\n  .hero-video::part(top-bar) { display: none; }\n  .hero-video::part(video) { object-fit: cover; }\n</style>` },
	{ slug: 'course', title: 'Course lesson', description: 'Chapters, resume where you left off, speed and captions.', component: Course, code: `<qyro-player id="lesson" ${bbb} title="Lesson 3"></qyro-player>\n\n<script>\n  const lesson = document.getElementById('lesson');\n  lesson.addEventListener('timeupdate', () => localStorage.setItem('resume', lesson.currentTime));\n  // A chapter link: lesson.seek(205); lesson.play();\n</script>` },
	{ slug: 'article', title: 'Article', description: 'Inline in a reading column, with a caption.', component: Article, code: `<figure>\n  <qyro-player src="${media.sintel.hls}" title="Sintel" start="20"></qyro-player>\n  <figcaption>Sintel © Blender Foundation, CC BY 3.0</figcaption>\n</figure>` },
	{ slug: 'product', title: 'Product page', description: 'A small looping player beside the product details.', component: Product, code: `<qyro-player ${bbb} title="See it in action" muted loop start="95"></qyro-player>` },
	{ slug: 'live', title: 'Live event', description: 'A live stream with the LIVE badge and a viewer count.', component: Live, code: `<qyro-player src="${media.live.dash}" title="Opening keynote" muted autoplay></qyro-player>` },
	{ slug: 'vertical', title: 'Vertical', description: '9:16 short-form for phones.', component: Vertical, code: `<qyro-player\n  ${bbb}\n  loop\n  style="--qyro-aspect-ratio: 9 / 16; --qyro-radius: 24px"\n></qyro-player>` },
	{ slug: 'playlist', title: 'Playlist', description: 'A series with an episode list that plays the next one.', component: Playlist, code: `<qyro-player id="show" src="/episode-1.m3u8" title="Episode 1"></qyro-player>\n\n<script>\n  const show = document.getElementById('show');\n  show.addEventListener('ended', () => {\n    show.setAttribute('autoplay', '');\n    show.src = '/episode-2.m3u8';\n  });\n</script>` },
	{ slug: 'theming', title: 'Theming playground', description: 'Pick colors, blur and radius; copy the CSS.', component: Theming, code: `qyro-player {\n  --qyro-accent: #ffd60a;\n  --qyro-glass-tint: rgb(10 20 40 / 0.45);\n  --qyro-glass-blur: 18px;\n  --qyro-radius: 24px;\n}` },
];
