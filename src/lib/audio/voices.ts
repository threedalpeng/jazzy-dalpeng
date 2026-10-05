/** Owns both currently sounding and future scheduled synth voices. */
export class SynthVoices {
	#voices = new Map<OscillatorNode, GainNode>();
	tone(
		ctx: AudioContext,
		frequency: number,
		time: number,
		duration: number,
		volume = 0.1,
		type: OscillatorType = 'triangle',
		signal?: AbortSignal
	) {
		if (signal?.aborted) return;
		const oscillator = ctx.createOscillator();
		const gain = ctx.createGain();
		oscillator.type = type;
		oscillator.frequency.value = frequency;
		gain.gain.setValueAtTime(0, time);
		gain.gain.linearRampToValueAtTime(volume, time + 0.005);
		gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
		oscillator.connect(gain);
		gain.connect(ctx.destination);
		this.#voices.set(oscillator, gain);
		const abort = () => this.#stopVoice(oscillator, gain);
		signal?.addEventListener('abort', abort, { once: true });
		oscillator.onended = () => {
			signal?.removeEventListener('abort', abort);
			this.#voices.delete(oscillator);
			oscillator.disconnect();
			gain.disconnect();
		};
		oscillator.start(time);
		oscillator.stop(time + duration + 0.01);
	}
	#stopVoice(oscillator: OscillatorNode, gain: GainNode) {
		const now = gain.context.currentTime;
		if (gain.gain.cancelAndHoldAtTime) gain.gain.cancelAndHoldAtTime(now);
		else {
			const level = gain.gain.value;
			gain.gain.cancelScheduledValues(now);
			gain.gain.setValueAtTime(level, now);
		}
		gain.gain.linearRampToValueAtTime(0, now + 0.005);
		try {
			oscillator.stop(now + 0.005);
		} catch {
			/* Already ended. */
		}
	}
	stop() {
		for (const [oscillator, gain] of this.#voices) this.#stopVoice(oscillator, gain);
	}
}
