import { TempoTimer } from '#lib/timer/tick.ts';

/** Shares the application's audio-clock scheduler; sounds are reference tones. */
export class LearningPlayer {
	readonly timer = new TempoTimer();
	private schedules: number[] = [];
	private voices = new Set<OscillatorNode>();
	private generation = 0;
	constructor(
		private onNote: (index: number | null) => void,
		private onState: (running: boolean, count: number | null) => void
	) {
		this.timer.timeSignature = { upper: 4, lower: 4 };
	}
	private tone(midi: number, time: number, duration: number, volume = 0.1) {
		const ctx = this.timer.audioCtx!;
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();
		osc.type = 'triangle';
		osc.frequency.value = 440 * 2 ** ((midi - 69) / 12);
		gain.gain.setValueAtTime(0, time);
		gain.gain.linearRampToValueAtTime(volume, time + 0.01);
		gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
		osc.connect(gain);
		gain.connect(ctx.destination);
		this.voices.add(osc);
		osc.onended = () => {
			this.voices.delete(osc);
			osc.disconnect();
			gain.disconnect();
		};
		osc.start(time);
		osc.stop(time + duration + 0.01);
	}
	async play(notes: number[], bpm: number, loop: boolean, countIn: boolean, chord = false) {
		this.stop();
		if (!notes.length) return;
		const version = this.generation;
		this.timer.bpm = bpm;
		const offset = countIn ? 4 : 0;
		const beats = chord ? 4 : notes.length;
		if (countIn)
			for (let beat = 0; beat < 4; beat++)
				this.schedules.push(
					this.timer.scheduleOnTempo({
						time: { start: beat / 4 },
						audio: ({ time }) => this.tone(beat === 0 ? 88 : 81, time, 0.07, 0.045),
						animation: () => {
							this.onState(true, 4 - beat);
						}
					})
				);
		const schedule = (index: number, start: number) => {
			const event = {
				time: { start: start / 4, interval: beats / 4 },
				audio: ({ time }: { time: number }) =>
					this.tone(notes[index], time, (60 / bpm) * (chord ? 2.8 : 0.75), chord ? 0.055 : 0.1),
				animation: () => {
					this.onNote(index);
					this.onState(true, null);
				}
			};
			this.schedules.push(
				loop ? this.timer.scheduleLoopOnTempo(event) : this.timer.scheduleOnTempo(event)
			);
		};
		notes.forEach((_, index) => schedule(index, offset + (chord ? 0 : index)));
		if (!loop)
			this.schedules.push(
				this.timer.scheduleOnTempo({
					time: { start: (offset + beats) / 4 },
					animation: () => this.stop()
				})
			);
		this.onState(true, countIn ? 4 : null);
		try {
			await this.timer.start();
			if (version !== this.generation) return;
			if (!this.timer.isRunning) {
				this.stop();
				throw new Error('Audio unavailable');
			}
		} catch (error) {
			if (version === this.generation) this.stop();
			throw error;
		}
	}
	stop() {
		this.generation++;
		this.timer.stop();
		this.schedules.forEach((id) => this.timer.cancelSchedule(id));
		this.schedules = [];
		this.voices.forEach((voice) => {
			try {
				voice.stop();
			} catch {
				/* Already ended. */
			}
		});
		this.voices.clear();
		this.onNote(null);
		this.onState(false, null);
	}
	destroy() {
		this.stop();
		this.timer.destroy();
	}
}
