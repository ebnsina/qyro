/**
 * `{@attach inView(fn)}`: runs `fn` when the element scrolls into view; only the first time unless
 * `once` is false.
 */
export const inView =
	(
		fn: () => void,
		{ once = true, ...options }: IntersectionObserverInit & { once?: boolean } = {}
	) =>
	(node: Element) => {
		const io = new IntersectionObserver(([e]) => {
			if (!e.isIntersecting) return;
			if (once) io.disconnect();
			fn();
		}, options);
		io.observe(node);
		return () => io.disconnect();
	};
