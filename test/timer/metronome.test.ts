import { afterEach, beforeEach, expect, it, vi } from 'vitest';
const voices = vi.hoisted(() => ({ tone: vi.fn(), stop: vi.fn() }));
vi.mock('../../src/lib/audio/voices', () => ({
	SynthVoices: class {
		tone = voices.tone;
		stop = voices.stop;
	}
}));
vi.mock('../../src/lib/timer/timer-worker?worker', () => ({
	default: class {
		postMessage = vi.fn();
		addEventListener = vi.fn();
		terminate = vi.fn();
	}
}));
import { TempoTimer } from '../../src/lib/timer/tick';
import Metronome from '../../src/lib/device/metronome/metronome';
let timer: TempoTimer;
let metronome: Metronome;
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
			resume = async () => {};
			close = vi.fn(async () => {});
		}
	);
	timer = new TempoTimer();
	timer.timeSignature = { upper: 4, lower: 4 };
	metronome = new Metronome(timer);
});
afterEach(() => {
	metronome.destroy();
	timer.destroy();
	vi.unstubAllGlobals();
	vi.clearAllMocks();
});
it('cancels sounding and queued clicks when the timer stops', async () => {
	const beat = vi.fn();
	metronome.onBeat(beat);
	metronome.schedule();
	await timer.start();
	expect(voices.tone.mock.calls[0][1]).toBe(880);
	voices.stop.mockClear();
	timer.stop();
	expect(voices.stop).toHaveBeenCalledTimes(1);
	expect(beat).toHaveBeenLastCalledWith(expect.objectContaining({ currentBeat: 0 }));
});
it('rebuilds the beat interval when the denominator changes', () => {
	const loop = vi.spyOn(timer, 'scheduleLoopOnTempo');
	metronome.schedule();
	timer.signatureUnit = 8;
	expect(loop.mock.calls.map(([event]) => event.time.interval)).toEqual([0.25, 0.125]);
});
