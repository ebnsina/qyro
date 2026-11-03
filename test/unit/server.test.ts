import { describe, expect, it } from 'vitest';

// Server rendering imports the package with no DOM; this must not throw.
describe('import without a DOM', () => {
	it('loads the entry in Node', async () => {
		const mod = await import('../../src/index');
		expect(typeof mod.QyroPlayer).toBe('function');
		expect(typeof mod.version).toBe('string');
	});
});
