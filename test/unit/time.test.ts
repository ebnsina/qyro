import { describe, expect, it } from 'vitest';
import { formatTime, speakTime, splitStart, timeWidth, withStart } from '../../src/controls/time';

describe('formatTime', () => {
	it('shows minutes and seconds under an hour', () => {
		expect(formatTime(0)).toBe('0:00');
		expect(formatTime(9.99)).toBe('0:09');
		expect(formatTime(75)).toBe('1:15');
		expect(formatTime(3599)).toBe('59:59');
	});
	it('adds hours from an hour up', () => {
		expect(formatTime(3600)).toBe('1:00:00');
		expect(formatTime(3725)).toBe('1:02:05');
		expect(formatTime(36000)).toBe('10:00:00');
	});
	it('matches the shape of the duration so labels never change length', () => {
		expect(formatTime(5, 5530)).toBe('0:00:05');
		expect(formatTime(65, 1200)).toBe('01:05');
		expect(formatTime(65, 300)).toBe('1:05');
		expect(formatTime(7, 40000)).toBe('00:00:07');
		expect(formatTime(0, 634)).toBe('00:00');
	});

	it('sizes the label for the longest time plus a sign', () => {
		expect(timeWidth(12)).toBe(5);
		expect(timeWidth(634)).toBe(6);
		expect(timeWidth(5530)).toBe(8);
		expect(timeWidth(40000)).toBe(9);
		for (const d of [12, 634, 5530]) for (const t of [0, d / 2, d]) expect(`-${formatTime(t, d)}`.length).toBeLessThanOrEqual(timeWidth(d));
	});

	it('reads bad input as zero', () => {
		expect(formatTime(NaN)).toBe('0:00');
		expect(formatTime(Infinity)).toBe('0:00');
		expect(formatTime(-5)).toBe('0:00');
	});
});

describe('speakTime', () => {
	it('names each unit, singular when one', () => {
		expect(speakTime(0)).toBe('0 seconds');
		expect(speakTime(1)).toBe('1 second');
		expect(speakTime(61)).toBe('1 minute, 1 second');
		expect(speakTime(3720)).toBe('1 hour, 2 minutes');
	});
});

describe('start times in URLs', () => {
	it('writes and reads #t=', () => {
		expect(withStart('https://a.test/v.m3u8', 91.7)).toBe('https://a.test/v.m3u8#t=91');
		expect(withStart('https://a.test/v.m3u8#t=5', 12)).toBe('https://a.test/v.m3u8#t=12');
		expect(splitStart('https://a.test/v.m3u8#t=91')).toEqual({ src: 'https://a.test/v.m3u8', start: 91 });
		expect(splitStart('https://a.test/v.m3u8#t=2.5')).toEqual({ src: 'https://a.test/v.m3u8', start: 2.5 });
	});
	it('leaves other URLs alone', () => {
		expect(splitStart('https://a.test/v.mpd')).toEqual({ src: 'https://a.test/v.mpd', start: null });
		expect(splitStart('https://a.test/v.mpd#x')).toEqual({ src: 'https://a.test/v.mpd#x', start: null });
	});
});
