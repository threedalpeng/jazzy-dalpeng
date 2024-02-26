import { TempoTimer, type AudioTickState, type TempoState, type TickState } from '../../timer/tick';

export interface MetronomeOption {
	beatPerBar?: number;
	signatureUnit?: number;
	bpm?: number;
}
export interface MetronomeState {
	tempo: TempoState;
	currentBeat: number;
	currentBar: number;
}
export type OnBeatCallback = (state: MetronomeState) => unknown;
export type OnBarCallback = (state: MetronomeState) => unknown;

class Metronome {
	#timer: TempoTimer;
	constructor(timer: TempoTimer) {
		this.#timer = timer;
		this.#timer.onStart(() => {});
		this.#timer.onStop(() => {});
	}

	get timer() {
		return this.#timer;
	}

	#isScheduled: boolean = false;
	get isScheduled() {
		return this.#isScheduled;
	}

	#scheduleId: number = -1;
	schedule() {
		if (!this.#isScheduled) {
			this.#isScheduled = true;
			this.#timer.scheduleLoopOnTempo({
				time: { start: 0, interval: this.#notesPerBeat },
				cb: this.#onTick.bind(this),
				audioCb: this.#scheduleAudio.bind(this)
			});
			return this.removeSchedule.bind(this);
		}
	}
	removeSchedule() {
		if (this.#isScheduled) {
			this.#isScheduled = false;
			this.#timer.cancelSchedule(this.#scheduleId);
		}
	}

	#onTick({ time, tickPassed }: TickState) {
		const beatPassed = tickPassed / this.#ticksPerBeat;
		const barPassed = beatPassed / this.#timer.beatPerBar;
		const currentBeat = (beatPassed % this.#timer.beatPerBar) + 1;
		this.#onBeatCallbacks.forEach((cb) =>
			cb({
				tempo: this.#timer.tempoState,
				currentBeat,
				currentBar: barPassed
			})
		);
		if (currentBeat === 1) {
			this.#onBarCallbacks.forEach((cb) =>
				cb({
					tempo: this.#timer.tempoState,
					currentBeat,
					currentBar: barPassed
				})
			);
		}
	}

	#masterGain: GainNode | null = null;
	get #notesPerBeat() {
		return this.#timer.convert(1, 'beat', 'note');
	}
	get #ticksPerBeat() {
		return this.#timer.convert(1, 'beat', 'tick');
	}
	#scheduleAudio({ audioCtx, time, tickPassed }: AudioTickState) {
		if (!this.#masterGain) {
			this.#masterGain = audioCtx.createGain();
			this.#masterGain.connect(audioCtx.destination);
		}
		const beatPassed = tickPassed / this.#ticksPerBeat;
		const barPassed = beatPassed / this.#timer.beatPerBar;
		const currentBeat = (beatPassed % this.#timer.beatPerBar) + 1;

		const osc = audioCtx.createOscillator();
		const gain = audioCtx.createGain();
		osc.connect(gain);
		gain.connect(this.#masterGain);
		if (currentBeat === 1) {
			osc.frequency.value = 880;
		} else {
			osc.frequency.value = 440;
		}
		osc.start(time);
		osc.stop(time + 0.1);
		gain.gain.setValueAtTime(gain.gain.value, time + 0.01);
		gain.gain.linearRampToValueAtTime(0.0001, time + 0.1);
		osc.addEventListener('ended', () => {
			gain.disconnect();
		});
	}

	#onBeatCallbacks = new Set<OnBeatCallback>();
	onBeat(cb: OnBeatCallback) {
		this.#onBeatCallbacks.add(cb);
	}
	removeBeat(cb: OnBeatCallback) {
		this.#onBeatCallbacks.delete(cb);
	}

	#onBarCallbacks = new Set<OnBeatCallback>();
	onBar(cb: OnBarCallback) {
		this.#onBarCallbacks.add(cb);
	}
	removeBar(cb: OnBarCallback) {
		this.#onBarCallbacks.delete(cb);
	}

	clearDerivedSchedule() {
		this.#onBeatCallbacks.clear();
		this.#onBarCallbacks.clear();
	}

	destroy() {
		this.removeSchedule();
		this.clearDerivedSchedule();
	}
}

export default Metronome;
