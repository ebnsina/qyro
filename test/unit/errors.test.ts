import { describe, expect, it } from 'vitest';
import { describeError, describeMediaError } from '../../src/engine/errors';

describe('describeError', () => {
	it('sorts Shaka errors into plain kinds', () => {
		expect(describeError({ category: 1, code: 1002 }).kind).toBe('network');
		expect(describeError({ category: 1, code: 1001, data: ['u', 404] }).kind).toBe('not-found');
		expect(describeError({ category: 1, code: 1001, data: ['u', 503] }).kind).toBe('network');
		expect(describeError({ category: 4, code: 4032 }).kind).toBe('unsupported');
		expect(describeError({ category: 3, code: 3016 }).kind).toBe('unsupported');
		expect(describeError({ category: 6, code: 6007 }).kind).toBe('drm');
		expect(describeError({ category: 7, code: 7002 }).kind).toBe('unknown');
		expect(describeError(null).kind).toBe('unknown');
	});

	it('says offline first when the browser is offline', () => {
		expect(describeError({ category: 1, code: 1002 }, false).kind).toBe('offline');
	});

	it('keeps the code and gives a title and message', () => {
		const e = describeError({ category: 6, code: 6007 });
		expect(e.code).toBe(6007);
		expect(e.title).toBeTruthy();
		expect(e.message).toBeTruthy();
	});

	it('reads plain media errors', () => {
		expect(describeMediaError(4).kind).toBe('unsupported');
		expect(describeMediaError(2).kind).toBe('network');
	});
});
