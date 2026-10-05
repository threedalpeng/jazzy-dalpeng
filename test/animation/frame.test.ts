import { afterEach, expect, it, vi } from 'vitest';
vi.mock('svelte', () => ({ flushSync: vi.fn() }));
import { flushSync } from 'svelte';
import { onFrame } from '../../src/lib/animation/frame';
afterEach(() => vi.unstubAllGlobals());
it('updates every clock, commits Svelte, then draws, using a single cancellable frame', () => {
	const operations: string[] = [];
	vi.mocked(flushSync).mockImplementation(() => {
		operations.push('commit');
	});
	vi.stubGlobal(
		'requestAnimationFrame',
		vi.fn(() => 7)
	);
	vi.stubGlobal('cancelAnimationFrame', vi.fn());
	const removeDraw = onFrame(() => operations.push('draw'), 'draw');
	const removeUpdate = onFrame(() => operations.push('update'));
	expect(requestAnimationFrame).toHaveBeenCalledTimes(1);
	vi.mocked(requestAnimationFrame).mock.calls[0][0](10);
	expect(operations).toEqual(['update', 'commit', 'draw']);
	removeUpdate();
	removeDraw();
	expect(cancelAnimationFrame).toHaveBeenCalledWith(7);
});
