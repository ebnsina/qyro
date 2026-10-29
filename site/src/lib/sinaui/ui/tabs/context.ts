import { createContext } from 'svelte';

export interface TabsContext {
	readonly value: string | undefined;
	readonly orientation: 'horizontal' | 'vertical';
	readonly activation: 'automatic' | 'manual';
	readonly variant: 'line' | 'folder' | 'pill';
	select(value: string): void;
	ids(value: string): { tab: string; panel: string };
}

export const [getTabs, setTabs] = createContext<TabsContext>();
