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
class AudioTickTimer {
	audioCtx: AudioContext | null = null;
	lookaheadTimer = new TimerWorker();

	constructor(tickIntervalMs: number = 10) {
		this.tickIntervalMs = tickIntervalMs;
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
	tickIntervalMs = 10;
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
			// fast initial lookhead
			this.#onLookahead();
			this.lookaheadTimer.postMessage('start');
			this.#nextTick = this.audioCtx.currentTime;
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
			this.#nextTick += 0.001 * this.tickIntervalMs;
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

export default AudioTickTimer;
