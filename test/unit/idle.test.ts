import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { IdleTimer } from '../../src/controls/idle';
import { tapper } from '../../src/controls/gestures';

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('IdleTimer', () => {
	const make = () => {
		const events: string[] = [];
		const t = new IdleTimer(2000, () => events.push('idle'), () => events.push('active'));
		return { t, events };
	};

	it('goes idle after the delay without activity', () => {
		const { t, events } = make();
		t.poke();
		vi.advanceTimersByTime(1999);
		expect(t.idle).toBe(false);
		vi.advanceTimersByTime(1);
		expect(t.idle).toBe(true);
		expect(events).toEqual(['idle']);
	});

	it('restarts the countdown on activity and wakes up once', () => {
		const { t, events } = make();
		t.poke();
		vi.advanceTimersByTime(1500);
		t.poke();
		vi.advanceTimersByTime(1500);
		expect(t.idle).toBe(false);
		vi.advanceTimersByTime(500);
		t.poke();
		t.poke();
		expect(events).toEqual(['idle', 'active']);
	});

	it('waits while it cannot sleep, then hides once it can', () => {
		let busy = true;
		const events: string[] = [];
		const t = new IdleTimer(2000, () => events.push('idle'), () => events.push('active'), () => !busy);
		t.poke();
		vi.advanceTimersByTime(6000);
		t.sleep();
		expect(t.idle).toBe(false);
		busy = false;
		vi.advanceTimersByTime(2000);
		expect(t.idle).toBe(true);
	});

	it('stays awake while held', () => {
		const { t } = make();
		t.sleep();
		t.hold();
		expect(t.idle).toBe(false);
		vi.advanceTimersByTime(10_000);
		expect(t.idle).toBe(false);
	});
});

describe('tapper', () => {
	it('fires a single tap after the delay', () => {
		const single = vi.fn();
		const double = vi.fn();
		const tap = tapper(250, single, double);
		tap('a');
		vi.advanceTimersByTime(249);
		expect(single).not.toHaveBeenCalled();
		vi.advanceTimersByTime(1);
		expect(single).toHaveBeenCalledWith('a');
		expect(double).not.toHaveBeenCalled();
	});

	it('turns quick taps into doubles that keep going', () => {
		const single = vi.fn();
		const double = vi.fn();
		const tap = tapper(250, single, double);
		tap(1);
		vi.advanceTimersByTime(100);
		tap(2);
		vi.advanceTimersByTime(100);
		tap(3);
		vi.advanceTimersByTime(1000);
		expect(single).not.toHaveBeenCalled();
		expect(double.mock.calls).toEqual([[2], [3]]);
	});
});
