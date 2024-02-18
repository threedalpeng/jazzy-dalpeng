import TimerWorker from './timer-worker?worker';

export interface TickState {
	/** shows the order of current tick after startup */
	tickPassed: number;
	/** scheduled tick time, in seconds */
	time: number;
}
export type AudioTickState = { audioCtx: AudioContext } & TickState;
export type TickCallback = (state: TickState) => unknown;
export type AudioTickCallback = (state: AudioTickState) => unknown;

const LOOKAHEAD_INTERVAL_MS = 100;
const SCHEDULE_AHEAD_SEC = 0.1;
const MS_PER_MIN = 60000;
export class AudioClockTimer {
	audioCtx: AudioContext | null = null;
	lookaheadTimer = new TimerWorker();

	get currentTime() {
		if (!this.audioCtx) {
			throw new TypeError("Timer hasn't yet started.");
		}
		return this.audioCtx.currentTime;
	}

	constructor(tickIntervalMs: number = 10) {
		this.#tickIntervalMs = tickIntervalMs;
		this.lookaheadTimer.postMessage({ interval: LOOKAHEAD_INTERVAL_MS });
		this.lookaheadTimer.addEventListener('message', (e) => {
			if (e.data === 'tick') {
				this.#onLookahead();
			}
		});
		window.requestAnimationFrame(this.#onAnimationFrame.bind(this));
	}

	#isRunning = false;
	#nextTick: number = 0;
	#tickPassed: number = 0;
	#tickIntervalMs = 10;
	get tickIntervalMs() {
		return this.#tickIntervalMs;
	}
	set tickIntervalMs(value: number) {
		this.#tickIntervalMs = value;
	}
	get isRunning() {
		return this.#isRunning;
	}
	start() {
		if (!this.audioCtx) {
			this.audioCtx = new AudioContext();

			// unlock the audio context
			const buffer = this.audioCtx.createBuffer(1, 1, 22050);
			const node = this.audioCtx.createBufferSource();
			node.buffer = buffer;
			node.start(0);
		}
		if (!this.#isRunning) {
			this.#isRunning = true;
			// delay initial lookhead
			this.#nextTick = this.audioCtx.currentTime + 0.1;
			this.lookaheadTimer.postMessage('start');
			this.#tickPassed = 0;
		}
	}

	#tickQueue: TickState[] = [];
	#onLookahead() {
		// schedule audio
		// and push expected events to queues
		// in this case, metronome ticks will be queued
		while (this.#nextTick < this.audioCtx!!.currentTime + SCHEDULE_AHEAD_SEC) {
			this.#audioTickCallbacks.forEach((cb) =>
				cb({ audioCtx: this.audioCtx!!, time: this.#nextTick, tickPassed: this.#tickPassed })
			);
			this.#tickQueue.push({ time: this.#nextTick, tickPassed: this.#tickPassed });
			this.#tickPassed += 1;
			this.#nextTick += 0.001 * this.#tickIntervalMs;
		}
	}

	#audioTickCallbacks: Set<AudioTickCallback> = new Set();
	onAudioTick(cb: AudioTickCallback) {
		this.#audioTickCallbacks.add(cb);
	}
	removeAudioTick(cb: AudioTickCallback) {
		this.#audioTickCallbacks.delete(cb);
	}

	#tickCallbacks: Set<TickCallback> = new Set();
	onTick(cb: TickCallback) {
		this.#tickCallbacks.add(cb);
	}
	removeTick(cb: TickCallback) {
		this.#tickCallbacks.delete(cb);
	}

	#onAnimationFrame() {
		if (this.audioCtx) {
			const currentTime = this.audioCtx.currentTime;
			let tickState = this.#tickQueue[0];
			while (tickState !== undefined && tickState.time <= currentTime) {
				this.#tickQueue.shift();
				this.#tickCallbacks.forEach((cb) => {
					cb(tickState);
				});
				tickState = this.#tickQueue[0];
			}
		}
		window.requestAnimationFrame(this.#onAnimationFrame.bind(this));
	}

	stop() {
		if (this.#isRunning) {
			this.lookaheadTimer.postMessage('stop');
			this.#isRunning = false;
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

	destroy() {
		this.stop();
		this.#audioTickCallbacks.clear();
		this.#tickCallbacks.clear();
	}
}

type TimeUnit = 'tick' | 'note' | 'beat' | 'bar' | 'second' | 'millisecond';

export class TempoTimer extends AudioClockTimer {
	#bpm = 120;
	get bpm() {
		return this.#bpm;
	}
	set bpm(value: number) {
		this.#bpm = value;
		this.#updateTickInterval();
	}

	#ticksPerNote = 192;
	get ticksPerNote() {
		return this.#ticksPerNote;
	}
	set ticksPerNote(value: number) {
		this.#ticksPerNote = value;
		this.#updateTickInterval();
	}
	#beatPerBar: number = 6;
	get beatPerBar() {
		return this.#beatPerBar;
	}
	set beatPerBar(value: number) {
		this.#beatPerBar = value;
	}

	#signatureUnit: number = 8;
	get signatureUnit() {
		return this.#signatureUnit;
	}
	set signatureUnit(value: number) {
		this.#signatureUnit = value;
		this.#updateTickInterval();
	}

	get timeSignature() {
		return { upper: this.#beatPerBar, lower: this.#signatureUnit };
	}
	set timeSignature({ upper, lower }: { upper: number; lower: number }) {
		this.beatPerBar = upper;
		this.signatureUnit = lower;
	}

	// #tickIntervalMs: number = (MS_PER_MIN * this.#signatureUnit) / (this.#bpm * this.#ticksPerNote);
	get tickIntervalMs(): number {
		return super.tickIntervalMs;
	}
	set tickIntervalMs(_: never) {
		throw new TypeError('Cannot set tickIntervalMs directly');
	}

	constructor() {
		super();
		this.#updateTickInterval();
	}
	#updateTickInterval() {
		super.tickIntervalMs = (MS_PER_MIN * this.#signatureUnit) / (this.#bpm * this.#ticksPerNote);
	}

	/**
	 * convert the {value} in units {from} into units {to}.
	 *
	 * This will round up in tick units, so the same time
	 * unit in {from} and {to} doesn't guarantee the same result.
	 * */
	convert(value: number, from: TimeUnit, to: TimeUnit) {
		let ticks = 0;
		switch (from) {
			case 'tick':
				ticks = value;
				break;
			case 'note':
				ticks = value * this.#ticksPerNote;
				break;
			case 'beat':
				ticks = (value * this.#ticksPerNote) / this.#signatureUnit;
				break;
			case 'bar':
				ticks = (value * this.#ticksPerNote * this.#beatPerBar) / this.#signatureUnit;
				break;
			case 'second':
				ticks = (value / this.tickIntervalMs) * 1000;
				break;
			case 'millisecond':
				ticks = value / this.tickIntervalMs;
				break;
		}
		ticks = Math.round(ticks);
		switch (to) {
			case 'tick':
				return ticks;
			case 'note':
				return ticks / this.#ticksPerNote;
			case 'beat':
				return (value * this.#signatureUnit) / this.#ticksPerNote;
			case 'bar':
				return (value * this.#signatureUnit) / (this.#ticksPerNote * this.#beatPerBar);
			case 'second':
				return (ticks * this.tickIntervalMs) / 1000;
			case 'millisecond':
				return ticks * this.tickIntervalMs;
		}
	}
}
