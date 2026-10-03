import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('../../src/lib/timer/timer-worker?worker', () => ({
	default: class {
		postMessage = vi.fn();
		addEventListener = vi.fn();
		terminate = vi.fn();
	}
}));
import { TempoTimer } from '../../src/lib/timer/tick';
let timer: TempoTimer;
beforeEach(() => {
	vi.stubGlobal('window', { requestAnimationFrame: vi.fn(() => 1) });
	vi.stubGlobal('cancelAnimationFrame', vi.fn());
	vi.stubGlobal(
		'AudioContext',
		class {
			state = 'running';
			currentTime = 0;
			resume = vi.fn(async () => {});
			close = vi.fn(async () => {});
		}
	);
	timer = new TempoTimer();
	timer.timeSignature = { upper: 4, lower: 4 };
});
afterEach(() => {
	timer.destroy();
	vi.unstubAllGlobals();
});
describe('tempo clock', () => {
	it('converts seconds, notes and bars into beats consistently', () => {
		expect(timer.convert(1, 'second', 'beat')).toBe(2);
		expect(timer.convert(1, 'note', 'beat')).toBe(4);
		expect(timer.convert(4, 'beat', 'bar')).toBe(1);
		expect(timer.convert(2, 'second', 'bar')).toBe(1);
	});
	it('terminates the worker and cancels its animation on destruction', () => {
		timer.destroy();
		expect(timer.lookaheadTimer.terminate).toHaveBeenCalled();
		expect(cancelAnimationFrame).toHaveBeenCalledWith(1);
	});
});

it('does not restart a stopped timer after asynchronous preparation completes', async () => {
	const { promise, resolve } = Promise.withResolvers<void>();
	timer.beforeStart(() => promise);
	const started = timer.start();
	await Promise.resolve();
	timer.stop();
	resolve();
	await started;
	expect(timer.isRunning).toBe(false);
});
it('unsubscribes preparation and stop callbacks from the correct sets', async () => {
	const prepare = vi.fn(async () => {});
	const stop = vi.fn();
	timer.beforeStart(prepare)();
	timer.onStop(stop)();
	await timer.start();
	timer.stop();
	expect(prepare).not.toHaveBeenCalled();
	expect(stop).not.toHaveBeenCalled();
});
