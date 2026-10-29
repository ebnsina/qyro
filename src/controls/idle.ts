/** Calls `onIdle` after `ms` without activity; `poke()` counts as activity and calls `onActive`. */
export class IdleTimer {
	#timer: ReturnType<typeof setTimeout> | undefined;
	#idle = false;

	constructor(
		private ms: number,
		private onIdle: () => void,
		private onActive: () => void,
		/** Checked when the countdown ends; while false, the timer waits another round instead of hiding. */
		private canSleep: () => boolean = () => true,
	) {}

	get idle(): boolean {
		return this.#idle;
	}

	/** Activity happened: wake up and restart the countdown. */
	poke(): void {
		if (this.#idle) {
			this.#idle = false;
			this.onActive();
		}
		this.#restart();
	}

	/** Go idle now, e.g. a tap that hides the controls. Does nothing while `canSleep` says no. */
	sleep(): void {
		if (!this.canSleep()) return this.#restart();
		this.stop();
		if (!this.#idle) {
			this.#idle = true;
			this.onIdle();
		}
	}

	/** Stop counting and stay awake, e.g. while paused or a menu is open. */
	hold(): void {
		this.stop();
		if (this.#idle) {
			this.#idle = false;
			this.onActive();
		}
	}

	stop(): void {
		clearTimeout(this.#timer);
		this.#timer = undefined;
	}

	#restart(): void {
		this.stop();
		this.#timer = setTimeout(() => (this.canSleep() ? this.sleep() : this.#restart()), this.ms);
	}
}
