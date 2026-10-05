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
	vi.stubGlobal(
		'requestAnimationFrame',
		vi.fn(() => 1)
	);
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
	it('terminates the worker and cancels its animation on destruction', async () => {
		await timer.start();
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

function frame() {
	const callbacks = vi.mocked(requestAnimationFrame).mock.calls;
	callbacks.at(-1)![0](performance.now());
}
function lookahead() {
	const listener = vi.mocked(timer.lookaheadTimer.addEventListener).mock
		.calls[0][1] as unknown as (event: { data: string }) => void;
	listener({ data: 'tick' });
}
it('reserves the first note immediately but presents it at the audible output position', async () => {
	const audio = vi.fn();
	const animation = vi.fn();
	timer.scheduleOnTempo({ time: { start: 0 }, audio, animation });
	await timer.start();
	Object.assign(timer.audioCtx!, { outputLatency: 0.04 });
	expect(audio).toHaveBeenCalledTimes(1);
	expect(audio.mock.calls[0][0].time).toBeCloseTo(0.1);
	Object.assign(timer.audioCtx!, { currentTime: 0.12 });
	frame();
	expect(animation).not.toHaveBeenCalled();
	Object.assign(timer.audioCtx!, { currentTime: 0.15 });
	frame();
	expect(animation).toHaveBeenCalledTimes(1);
});
it('skips missed audio and selects the current beat after a blocked main thread', async () => {
	const audio = vi.fn();
	const animation = vi.fn();
	timer.scheduleLoopOnTempo({ time: { start: 0, interval: 0.25 }, audio, animation });
	await timer.start();
	Object.assign(timer.audioCtx!, { currentTime: 10 });
	lookahead();
	frame();
	expect(audio).toHaveBeenCalledTimes(2);
	expect(audio.mock.calls[1][0].time).toBeCloseTo(10.1);
	expect(animation).toHaveBeenCalledTimes(1);
	expect(animation.mock.calls[0][0].time).toBeCloseTo(9.6);
});
it('cleans finite highlights on cancellation, stop, and normal expiration', async () => {
	const cleanup = vi.fn();
	const id = timer.scheduleOnTempo({
		time: { start: 0, duration: 0.25 },
		animation: () => cleanup
	});
	await timer.start();
	Object.assign(timer.audioCtx!, { currentTime: 0.15 });
	frame();
	timer.cancelSchedule(id);
	expect(cleanup).toHaveBeenCalledTimes(1);
	timer.stop();
	expect(cleanup).toHaveBeenCalledTimes(1);
	const animation = vi.fn(() => cleanup);
	timer.scheduleOnTempo({ time: { start: 0, duration: 0.25 }, animation });
	await timer.start();
	Object.assign(timer.audioCtx!, { currentTime: 0.3 });
	frame();
	Object.assign(timer.audioCtx!, { currentTime: 0.8 });
	frame();
	expect(cleanup).toHaveBeenCalledTimes(2);
});
it('does not replay expired finite notes when the first display frame is late', async () => {
	const animation = vi.fn();
	timer.scheduleOnTempo({ time: { start: 0, duration: 0.25 }, animation });
	await timer.start();
	Object.assign(timer.audioCtx!, { currentTime: 5 });
	frame();
	expect(animation).not.toHaveBeenCalled();
});
it('restarts a tempo change at a fresh bar and validates tempo before mutating it', async () => {
	const stop = vi.fn();
	timer.onStop(stop);
	await timer.start();
	timer.bpm = 90;
	await Promise.resolve();
	await Promise.resolve();
	expect(stop).toHaveBeenCalledTimes(1);
	expect(timer.isRunning).toBe(true);
	expect(() => {
		timer.bpm = 0;
	}).toThrow('Invalid bpm');
	expect(timer.bpm).toBe(90);
});
it('does not keep an animation loop alive while the clock is idle', () => {
	expect(requestAnimationFrame).not.toHaveBeenCalled();
});

it('aborts already reserved audio on cancellation and creates a fresh signal on restart', async () => {
	const audio = vi.fn();
	const id = timer.scheduleOnTempo({ time: { start: 0 }, audio });
	await timer.start();
	const signal = audio.mock.calls[0][0].signal as AbortSignal;
	expect(signal.aborted).toBe(false);
	timer.cancelSchedule(id);
	expect(signal.aborted).toBe(true);
	timer.stop();
	timer.scheduleOnTempo({ time: { start: 0 }, audio });
	await timer.start();
	const next = audio.mock.calls[1][0].signal as AbortSignal;
	expect(next).not.toBe(signal);
	expect(next.aborted).toBe(false);
	timer.stop();
	expect(next.aborted).toBe(true);
});

it('reports an asynchronous tempo restart failure and leaves playback stopped', async () => {
	const error = vi.fn();
	timer.onError(error);
	await timer.start();
	Object.assign(timer.audioCtx!, {
		resume: async () => {
			throw new Error('Device unavailable');
		}
	});
	timer.bpm = 90;
	await Promise.resolve();
	await Promise.resolve();
	expect(timer.isRunning).toBe(false);
	expect(error).toHaveBeenCalledWith(expect.objectContaining({ message: 'Device unavailable' }));
});

it('reports a context that cannot enter the running state', async () => {
	timer.audioCtx = new AudioContext();
	Object.assign(timer.audioCtx, { state: 'suspended' });
	await expect(timer.start()).rejects.toThrow('Audio unavailable');
	expect(timer.isRunning).toBe(false);
});
