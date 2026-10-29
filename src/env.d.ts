declare module '*.css?inline' {
	const css: string;
	export default css;
}

declare module '@seyr/video' {
	export const monitor: unknown;
}

declare module '@seyr/video/shaka' {
	export const shaka: unknown;
}
