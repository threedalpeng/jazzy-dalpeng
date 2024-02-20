import { TempoTimer, type AudioTickState, type TickState } from '../../timer/tick';

export interface MetronomeOption {
	beatPerBar?: number;
	signatureUnit?: number;
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
		const { beatPerBar = 4, bpm = 120, signatureUnit = 4 } = option;
		this.beatPerBar = beatPerBar;
		this.bpm = bpm;
		this.timer.signatureUnit = signatureUnit;
	}

	get beatPerBar() {
		return this.timer.beatPerBar;
	}
	set beatPerBar(value: number) {
		this.timer.beatPerBar = value;
		this.#onOptionChangeCallbacks.forEach((cb) => cb(this.state));
		this.restart();
	}

	#bpm = 120;
	get bpm() {
		return this.#bpm;
	}
	set bpm(value: number) {
		this.timer.bpm = value;
		this.#onOptionChangeCallbacks.forEach((cb) => cb(this.state));
	}

	timer = new TempoTimer();

	get state() {
		return {
			beatPerBar: this.beatPerBar,
			bpm: this.bpm,
			currentBeat: this.#currentBeat,
			barPassed: this.#barPassed
		};
	}

	#isRunning = false;
	get isRunning() {
		return this.#isRunning;
	}
	start(): void {
		if (!this.#isRunning) {
			this.#isRunning = true;
			this.timer.start();
		}
	}

	#stopScheduling: (() => void) | null = null;
	schedule() {
		this.#stopScheduling = this.timer.loop(
			{ start: 0, duration: this.#notesPerBeat },
			this.#onTick.bind(this),
			this.#scheduleAudio.bind(this)
		);
	}

	#currentBeat = 0;
	#barPassed = 0;
	#onTick({ time, tickPassed }: TickState) {
		this.#currentBeat += 1;
		this.#onBeatCallbacks.forEach((cb) => cb(this.state));
		if (this.#currentBeat % this.timer.beatPerBar === 1) {
			this.#onBarCallbacks.forEach((cb) => cb(this.state));
		}

		if (this.#currentBeat >= this.timer.beatPerBar) {
			this.#barPassed++;
			this.#currentBeat = 0;
		}
	}

	#masterGain: GainNode | null = null;
	get #notesPerBeat() {
		return this.timer.convert(1, 'beat', 'note');
	}
	#currentBeatInAudioTick = 0;
	#scheduleAudio({ audioCtx, time, tickPassed }: AudioTickState) {
		if (!this.#masterGain) {
			this.#masterGain = audioCtx.createGain();
			this.#masterGain.connect(audioCtx.destination);
		}

		const osc = audioCtx.createOscillator();
		const gain = audioCtx.createGain();
		osc.connect(gain);
		gain.connect(this.#masterGain);
		if (this.#currentBeatInAudioTick % this.timer.beatPerBar === 0) {
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
		this.#currentBeatInAudioTick += 1;
	}

	stop() {
		if (this.#isRunning) {
			this.#isRunning = false;
			this.timer.stop();
			if (this.#stopScheduling) this.#stopScheduling();
			this.clearSchedule();
			this.#currentBeat = 0;
			this.#currentBeatInAudioTick = 0;
			this.#barPassed = 0;
		}
	}

	toggle(): void {
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

	#onOptionChangeCallbacks = new Set<OnOptionChangeCallback>();
	onOptionChange(cb: OnOptionChangeCallback) {
		this.#onOptionChangeCallbacks.add(cb);
	}
	removeOptionChange(cb: OnOptionChangeCallback) {
		this.#onOptionChangeCallbacks.delete(cb);
	}

	clearSchedule() {
		this.timer.clearSchedule();
		this.#onBeatCallbacks.clear();
		this.#onBarCallbacks.clear();
	}

	destroy() {
		this.stop();
		this.clearSchedule();
		this.#onOptionChangeCallbacks.clear();
	}
}

export default Metronome;
