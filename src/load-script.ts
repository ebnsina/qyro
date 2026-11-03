const scripts = new Map<string, Promise<void>>();

/** Adds a classic <script> once per URL and resolves when it has run. A failed URL can be tried again. */
export function loadScript(src: string, what: string): Promise<void> {
	let p = scripts.get(src);
	if (!p) {
		p = new Promise((resolve, reject) => {
			const s = document.createElement('script');
			s.src = src;
			s.async = true;
			s.onload = () => resolve();
			s.onerror = () => {
				scripts.delete(src);
				reject(new Error(`qyro: couldn't load ${what} from ${src}`));
			};
			document.head.append(s);
		});
		scripts.set(src, p);
	}
	return p;
}
