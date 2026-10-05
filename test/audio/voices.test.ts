import { expect, it, vi } from 'vitest';
import { SynthVoices } from '../../src/lib/audio/voices';
it('fades sounding voices and cancels future starts, then disconnects ended nodes', () => {
	const oscillator = {
		frequency: { value: 0 },
		connect: vi.fn(),
		disconnect: vi.fn(),
		start: vi.fn(),
		stop: vi.fn(),
		onended: null as (() => void) | null
	};
	const param = {
		setValueAtTime: vi.fn(),
		linearRampToValueAtTime: vi.fn(),
		exponentialRampToValueAtTime: vi.fn(),
		cancelAndHoldAtTime: vi.fn()
	};
	const gain = { gain: param, connect: vi.fn(), disconnect: vi.fn(), context: { currentTime: 1 } };
	const ctx = {
		createOscillator: () => oscillator,
		createGain: () => gain,
		destination: {}
	} as unknown as AudioContext;
	const voices = new SynthVoices();
	voices.tone(ctx, 440, 2, 0.1);
	voices.stop();
	expect(param.cancelAndHoldAtTime).toHaveBeenCalledWith(1);
	expect(oscillator.stop).toHaveBeenLastCalledWith(1.005);
	oscillator.onended!();
	expect(oscillator.disconnect).toHaveBeenCalledTimes(1);
	expect(gain.disconnect).toHaveBeenCalledTimes(1);
	voices.stop();
	expect(oscillator.stop).toHaveBeenCalledTimes(2);
});
