import AudioTickTimer from '../../timer/tick';

export interface MetronomeOption {
	beatPerBar?: number;
	beatUnit?: number;
	bpm?: number;
}
export interface MetronomeState {
	beatPerBar: number;
	bpm: number;
	currentBeat: number;
	barPassed: number;
}
export type OnBeatCallback = (state: MetronomeState) => unknown;
export type OnBarCallback = (state: MetronomeState) => unknown;
export type OnOptionChangeCallback = (state: MetronomeState) => unknown;

// beat per minute == beat/minute == beat/(second * 60) === beat/(ms * 60 * 1000)
const MILLISECOND_PER_MINUTE = 60000;
class Metronome {
	constructor(option: MetronomeOption = {}) {
		const { beatPerBar = 4, bpm = 120 } = option;
		this.beatPerBar = beatPerBar;
		this.bpm = bpm;
		this.#timer.onTick(this.onTick.bind(this));
		this.#timer.onAudioTick(this.scheduleAudio.bind(this));
	}

	#beatPerBar = 4;
	get beatPerBar() {
		return this.#beatPerBar;
	}
	set beatPerBar(value: number) {
		this.#beatPerBar = value;
		this.updateInterval();
		this.#onOptionChangeCallbacks.forEach((cb) => cb(this.state));
		this.restart();
	}

	#bpm = 120;
	get bpm() {
		return this.#bpm;
	}
	set bpm(value: number) {
		this.#bpm = value;
		this.updateInterval();
		this.#onOptionChangeCallbacks.forEach((cb) => cb(this.state));
		this.restart();
	}

	#interval = MILLISECOND_PER_MINUTE / this.#bpm;
	updateInterval() {
		this.#interval = MILLISECOND_PER_MINUTE / this.#bpm;
		this.#timer.tickIntervalMs = this.#interval;
	}

	#timer = new AudioTickTimer(this.#interval);

	get state() {
		return {
			beatPerBar: this.#beatPerBar,
			bpm: this.#bpm,
			currentBeat: this.#currentBeat,
			barPassed: this.#barPassed
		};
	}

	#isRunning = false;
	get isRunning() {
		return this.#isRunning;
	}
	start() {
		if (!this.#isRunning) {
			this.#isRunning = true;
			this.#timer.start();
		}
	}

	#currentBeat = 0;
	#barPassed = 0;
	onTick({ startSec }: { startSec: number }) {
		this.#onBeatCallbacks.forEach((cb) => cb(this.state));
		if (this.#currentBeat === 0) {
			this.#onBarCallbacks.forEach((cb) => cb(this.state));
		}

		this.#currentBeat++;
		if (this.#currentBeat >= this.#beatPerBar) {
			this.#barPassed++;
			this.#currentBeat = 0;
		}
	}

	scheduleAudio({ audioCtx, startSec }: { audioCtx: AudioContext; startSec: number }) {}

	stop() {
		if (this.#isRunning) {
			this.#isRunning = false;
			this.#timer.stop();
			this.#currentBeat = 0;
			this.#barPassed = 0;
		}
	}

	toggle() {
		if (this.#isRunning) {
			this.stop();
		} else {
			this.start();
		}
	}
	restart() {
		if (this.#isRunning) {
			this.stop();
			this.start();
		}
	}

	#onBeatCallbacks = new Set<OnBeatCallback>();
	onBeat(cb: OnBeatCallback) {
		this.#onBeatCallbacks.add(cb);
	}

	#onBarCallbacks = new Set<OnBeatCallback>();
	onBar(cb: OnBarCallback) {
		this.#onBarCallbacks.add(cb);
	}

	#onOptionChangeCallbacks = new Set<OnOptionChangeCallback>();
	onOptionChange(cb: OnOptionChangeCallback) {
		this.#onOptionChangeCallbacks.add(cb);
	}

	destroy() {
		this.stop();
		this.#onBeatCallbacks.clear();
		this.#onBarCallbacks.clear();
		this.#onOptionChangeCallbacks.clear();
	}
}

export default Metronome;
