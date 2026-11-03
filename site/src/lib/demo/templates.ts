import type { Component } from 'svelte';
import { BookOpen01Icon, ClapperboardIcon, ColorsIcon, LiveStreaming02Icon, Megaphone01Icon, News01Icon, PlayListIcon, ShoppingBag01Icon, SmartPhone01Icon, Video01Icon } from '@hugeicons/core-free-icons';
import Article from './Article.svelte';
import Cinema from './Cinema.svelte';
import Course from './Course.svelte';
import Hero from './Hero.svelte';
import Live from './Live.svelte';
import Playlist from './Playlist.svelte';
import Product from './Product.svelte';
import Theming from './Theming.svelte';
import Vertical from './Vertical.svelte';

type IconNode = readonly (readonly [string, Readonly<Record<string, string | number>>])[];

export interface Template {
	slug: string;
	title: string;
	description: string;
	icon: IconNode;
	/** What sits around the one shared player; none for a plain embed. */
	side?: Component;
	/** Extra attributes this layout gives the player, on top of the state's. */
	player?: Record<string, string>;
}

export const templates: Template[] = [
	{ slug: 'standard', title: 'Standard', description: 'A plain embed with poster, title and thumbnails.', icon: Video01Icon },
	{ slug: 'cinema', title: 'Cinema', description: 'The film in its own wide shape, full width, with the lights down.', icon: ClapperboardIcon, side: Cinema, player: { style: '--qyro-aspect-ratio: 2.35' } },
	{ slug: 'hero', title: 'Marketing hero', description: 'A muted loop behind a headline.', icon: Megaphone01Icon, side: Hero, player: {} },
	{ slug: 'course', title: 'Course', description: 'Chapters, resume where you left off, captions.', icon: BookOpen01Icon, side: Course, player: { title: 'Lesson 3: Storytelling with animals' } },
	{ slug: 'article', title: 'Article', description: 'Inline in a reading column.', icon: News01Icon, side: Article },
	{ slug: 'product', title: 'Product', description: 'A small looping player beside product details.', icon: ShoppingBag01Icon, side: Product, player: { title: 'See it in action' } },
	{ slug: 'live', title: 'Live', description: 'A live stream with the LIVE badge and a viewer count.', icon: LiveStreaming02Icon, side: Live },
	{ slug: 'vertical', title: 'Vertical', description: '9:16 short-form for phones.', icon: SmartPhone01Icon, side: Vertical, player: { style: '--qyro-aspect-ratio: 9 / 16' } },
	{ slug: 'playlist', title: 'Playlist', description: 'An episode list that plays the next one.', icon: PlayListIcon, side: Playlist },
	{ slug: 'theming', title: 'Theming', description: 'Pick colors, blur and radius; copy the CSS.', icon: ColorsIcon, side: Theming },
];
