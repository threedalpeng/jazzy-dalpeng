import { SynthVoices } from '../../audio/voices';
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
	constructor(
		timer: TempoTimer,
		private ownsTimer = false
	) {
		this.#timer = timer;
		this.#timer.onTempoChanged(this.#onTempo);
		this.#removeStop = this.#timer.onStop(() => {
			this.#voices.stop();
			this.#onBeatCallbacks.forEach((callback) =>
				callback({ tempo: this.#timer.tempoState, currentBeat: 0, currentBar: 0 })
			);
		});
	}

	#onTempo = () => {
		if (this.#isScheduled) {
			this.removeSchedule();
			this.schedule();
		}
	};
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
			this.#scheduleId = this.#timer.scheduleLoopOnTempo({
				time: { start: 0, interval: this.#notesPerBeat },
				animation: this.#onTick.bind(this),
				audio: this.#scheduleAudio.bind(this)
			});
			return this.removeSchedule.bind(this);
		}
	}
	removeSchedule() {
		if (this.#isScheduled) {
			this.#isScheduled = false;
			this.#voices.stop();
			this.#timer.cancelSchedule(this.#scheduleId);
		}
	}

	#onTick({ tickPassed }: TickState) {
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

	#voices = new SynthVoices();
	#removeStop: () => void;
	get #notesPerBeat() {
		return this.#timer.convert(1, 'beat', 'note');
	}
	get #ticksPerBeat() {
		return this.#timer.convert(1, 'beat', 'tick');
	}
	#scheduleAudio({ audioCtx, time, tickPassed, signal }: AudioTickState) {
		const beat = tickPassed / this.#ticksPerBeat;
		this.#voices.tone(
			audioCtx,
			beat % this.#timer.beatPerBar === 0 ? 880 : 440,
			time,
			0.07,
			0.12,
			'sine',
			signal
		);
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
		this.#removeStop();
		this.#timer.removeTempoChanged(this.#onTempo);
		if (this.ownsTimer) this.#timer.destroy();
		this.clearDerivedSchedule();
	}
}

export default Metronome;
