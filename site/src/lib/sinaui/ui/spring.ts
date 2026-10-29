/** A damped spring's position at progress t (0 to 1): overshoots a little, then settles at 1. */
export function springAt(bounce: number) {
	const zeta = 1 - bounce;
	// Frequency chosen so the motion has all but settled by t = 1.
	const omega = 5 / zeta;
	const damped = omega * Math.sqrt(1 - zeta * zeta);
	return (t: number) =>
		t >= 1
			? 1
			: 1 -
				Math.exp(-zeta * omega * t) *
					(Math.cos(damped * t) + ((zeta * omega) / damped) * Math.sin(damped * t));
}

/**
 * The same spring as a CSS easing, sampled into linear(): it runs as a plain CSS transition, off the
 * main thread, and a transition interrupted part way picks up smoothly from where it is.
 */
export function spring(bounce = 0.2) {
	const at = springAt(bounce);
	return `linear(${Array.from({ length: 49 }, (_, i) => at(i / 48).toFixed(4)).join(', ')})`;
}
