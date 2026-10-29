/**
 * Tells single taps from double taps. A single tap fires after `delay` with no second tap;
 * every quick follow-up tap fires `onDouble`, so tapping on keeps seeking.
 */
export function tapper<T>(delay: number, onSingle: (at: T) => void, onDouble: (at: T) => void): (at: T) => void {
	let timer: ReturnType<typeof setTimeout> | undefined;
	let last = -Infinity;
	return (at) => {
		const now = Date.now();
		const quick = now - last < delay;
		last = now;
		clearTimeout(timer);
		if (quick) return onDouble(at);
		timer = setTimeout(() => onSingle(at), delay);
	};
}
