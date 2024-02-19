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
		this.timer.onTick(this.#onTick.bind(this));
		this.timer.onAudioTick(this.#scheduleAudio.bind(this));
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
	start() {
		if (!this.#isRunning) {
			this.#isRunning = true;
			this.timer.start();
		}
	}

	#currentBeat = 0;
	#barPassed = 0;
	#onTick({ time, tickPassed }: TickState) {
		if (tickPassed % this.#ticksPerBeat !== 0) {
			return;
		}
		this.#currentBeat = ((tickPassed / this.#ticksPerBeat) % this.timer.beatPerBar) + 1;
		this.#onBeatCallbacks.forEach((cb) => cb(this.state));
		if (this.#currentBeat % this.timer.beatPerBar === 1) {
			this.#onBarCallbacks.forEach((cb) => cb(this.state));
		}

		if (this.#currentBeat >= this.timer.beatPerBar) {
			this.#barPassed++;
		}
	}

	#masterGain: GainNode | null = null;
	get #ticksPerBeat() {
		return this.timer.convert(1, 'beat', 'tick');
	}
	#scheduleAudio({ audioCtx, time, tickPassed }: AudioTickState) {
		if (tickPassed % this.#ticksPerBeat !== 0) {
			return;
		}
		const beatNum = (tickPassed / this.#ticksPerBeat) % this.timer.beatPerBar;

		if (!this.#masterGain) {
			this.#masterGain = audioCtx.createGain();
			this.#masterGain.connect(audioCtx.destination);
		}

		const osc = audioCtx.createOscillator();
		const gain = audioCtx.createGain();
		osc.connect(gain);
		gain.connect(this.#masterGain);
		if (beatNum === 0) {
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

	stop() {
		if (this.#isRunning) {
			this.#isRunning = false;
			this.timer.stop();
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

	destroy() {
		this.stop();
		this.#onBeatCallbacks.clear();
		this.#onBarCallbacks.clear();
		this.#onOptionChangeCallbacks.clear();
	}
}

export default Metronome;
