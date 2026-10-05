vi.mock('../../src/lib/audio/voices', () => ({
	default: undefined,
	SynthVoices: class {
		tone = vi.fn();
		stop = vi.fn();
	}
}));
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
vi.mock('../../src/lib/timer/timer-worker?worker', () => ({
	default: class {
		postMessage = vi.fn();
		addEventListener = vi.fn();
		terminate = vi.fn();
	}
}));
import { LearningPlayer } from '../../src/lib/learning/player';
let player: LearningPlayer;
const note = vi.fn();
const state = vi.fn();
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
	player = new LearningPlayer(note, state);
});
afterEach(() => {
	player.destroy();
	vi.unstubAllGlobals();
	vi.clearAllMocks();
});
it('uses a single count-in followed by a cancellable repeated sequence', async () => {
	const loops = vi.spyOn(player.timer, 'scheduleLoopOnTempo');
	const oneShot = vi.spyOn(player.timer, 'scheduleOnTempo');
	const cancel = vi.spyOn(player.timer, 'cancelSchedule');
	await player.play([60, 62, 64], 120, true, true);
	expect(oneShot).toHaveBeenCalledTimes(4);
	expect(loops.mock.calls.map(([event]) => event.time)).toEqual([
		{ start: 1, interval: 0.75 },
		{ start: 1.25, interval: 0.75 },
		{ start: 1.5, interval: 0.75 }
	]);
	player.stop();
	expect(cancel).toHaveBeenCalledTimes(7);
	expect(player.timer.isRunning).toBe(false);
	expect(state).toHaveBeenLastCalledWith(false, null);
});
it('cannot resume playback after being stopped while audio prepares', async () => {
	const gate = Promise.withResolvers<void>();
	vi.stubGlobal(
		'AudioContext',
		class {
			state = 'running';
			currentTime = 0;
			resume = () => gate.promise;
			close = vi.fn(async () => {});
		}
	);
	const started = player.play([60], 72, false, false);
	player.stop();
	gate.resolve();
	await started;
	expect(player.timer.isRunning).toBe(false);
	expect(note).toHaveBeenLastCalledWith(null);
});
it('schedules all chord voices at the same musical time', async () => {
	const schedule = vi.spyOn(player.timer, 'scheduleOnTempo');
	await player.play([48, 52, 55], 72, false, false, true);
	expect(schedule.mock.calls.slice(0, 3).map(([event]) => event.time.start)).toEqual([0, 0, 0]);
	expect(schedule.mock.calls.at(-1)?.[0].time.start).toBe(1);
});
