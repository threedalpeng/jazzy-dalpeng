import { MultiMap } from '$/utils/multimap';
import type { WithCleanup } from '$/utils/types';
import type { ScoreTimestamp } from '../practice/types';
import { TickEvent } from './event';
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
	#nextTickOnSecond: number = 0;
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
			this.audioCtx.resume();
			this.#tickPassed = 0;
		}
		if (!this.#isRunning) {
			this.#isRunning = true;
			// delay initial lookhead
			this.#nextTickOnSecond = this.audioCtx.currentTime + 0.1;
			this.lookaheadTimer.postMessage('start');
			this.#startCallbacks.forEach((cb) => cb());
		}
	}

	#tickQueue: TickState[] = [];
	#onLookahead() {
		// schedule audio
		// and push expected events to queues
		// in this case, metronome ticks will be queued
		while (this.#nextTickOnSecond < this.audioCtx!!.currentTime + SCHEDULE_AHEAD_SEC) {
			const audioState = {
				audioCtx: this.audioCtx!!,
				time: this.#nextTickOnSecond,
				tickPassed: this.#tickPassed
			};

			const scheduleIdList = this.#schedules.getAll(this.#tickPassed);
			if (scheduleIdList) {
				scheduleIdList.forEach((id) => {
					const event = this.#events.get(id);
					if (event && event.audioCb) {
						event.audioCb(audioState);
					}
				});
			}

			this.#loopSchedules.forEach((id) => {
				const event = this.#events.get(id);
				if (event && event.interval) {
					if (
						event.start <= this.#tickPassed &&
						(this.#tickPassed - event.start) % event.interval === 0
					) {
						if (event.audioCb) {
							event.audioCb(audioState);
						}
					}
				}
			});

			this.#tickQueue.push({ time: this.#nextTickOnSecond, tickPassed: this.#tickPassed });
			this.#tickPassed += 1;
			this.#nextTickOnSecond += 0.001 * this.#tickIntervalMs;
		}
	}
	#onAnimationFrame() {
		if (this.audioCtx) {
			const currentTime = this.audioCtx.currentTime;
			let tickState = this.#tickQueue[0];
			while (tickState !== undefined && tickState.time <= currentTime) {
				this.#tickQueue.shift();
				const scheduleIdList = this.#schedules.getAll(this.#tickPassed);
				if (scheduleIdList !== undefined) {
					scheduleIdList.forEach((id) => {
						const event = this.#events.get(id);
						if (event && event.cb) {
							event.cb(tickState);
						}
					});
				}

				this.#loopSchedules.forEach((id) => {
					const event = this.#events.get(id);
					if (event && event.interval) {
						if (
							event.start <= tickState.tickPassed &&
							(tickState.tickPassed - event.start) % event.interval === 0
						) {
							if (event.cb) {
								event.cb(tickState);
							}
						}
					}
				});
				tickState = this.#tickQueue[0];
			}
		}
		window.requestAnimationFrame(this.#onAnimationFrame.bind(this));
	}

	#startCallbacks: Set<() => any> = new Set();
	onStart(cb: () => any) {
		this.#startCallbacks.add(cb);
		return () => this.removeStart(cb);
	}
	removeStart(cb: () => any) {
		this.#startCallbacks.delete(cb);
	}
	#stopCallbacks: Set<() => any> = new Set();
	onStop(cb: () => any) {
		this.#stopCallbacks.add(cb);
		return () => this.removeStart(cb);
	}
	removeStop(cb: () => any) {
		this.#stopCallbacks.delete(cb);
	}

	#schedules: MultiMap<number, number> = new MultiMap();
	#events: Map<number, TickEvent> = new Map();
	schedule(event: TickEvent) {
		this.#events.set(event.id, event);
		this.#schedules.set(event.start, event.id);
		return event.id;
	}

	#loopSchedules: Set<number> = new Set();
	scheduleLoop(event: TickEvent) {
		this.#events.set(event.id, event);
		this.#loopSchedules.add(event.id);
		return event.id;
	}

	cancelSchedule(eventId: number) {
		const event = this.#events.get(eventId);
		if (event) {
			this.#events.delete(eventId);
			const schedulesOnTick = this.#schedules.getAll(event.start);
			if (schedulesOnTick) {
				const idx = schedulesOnTick.indexOf(eventId);
				if (idx >= 0) schedulesOnTick.splice(idx, 1);
			}
		}
	}

	stop() {
		if (this.#isRunning) {
			this.lookaheadTimer.postMessage('stop');
			this.#isRunning = false;
			this.#tickPassed = 0;
			this.#tickQueue = [];
			this.#stopCallbacks.forEach((cb) => cb());
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
	}
}

type TimeUnit = 'tick' | 'note' | 'beat' | 'bar' | 'second' | 'millisecond';
export interface TempoSchedule {
	time: ScoreTimestamp;
	cb?: WithCleanup<TickCallback>;
	audioCb?: AudioTickCallback;
}
export interface TempoState {
	bpm: number;
	ticksPerNote: number;
	beatPerBar: number;
	signatureUnit: number;
	tickIntervalMs: number;
}
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
		this.#updateTickInterval();
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

	get tempoState(): TempoState {
		return {
			bpm: this.#bpm,
			ticksPerNote: this.#ticksPerNote,
			beatPerBar: this.#beatPerBar,
			signatureUnit: this.#signatureUnit,
			tickIntervalMs: this.tickIntervalMs
		};
	}

	constructor() {
		super();
		this.#updateTickInterval();
	}
	#updateTickInterval() {
		super.tickIntervalMs = (MS_PER_MIN * this.#signatureUnit) / (this.#bpm * this.#ticksPerNote);
		this.#tempoChangedCallbacks.forEach((cb) => cb(this.tempoState));
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

	#tempoChangedCallbacks: Set<(state: TempoState) => any> = new Set();
	onTempoChanged(cb: (state: TempoState) => any) {
		this.#tempoChangedCallbacks.add(cb);
	}
	removeTempoChanged(cb: (state: TempoState) => any) {
		this.#tempoChangedCallbacks.delete(cb);
	}

	scheduleOnTempo({ time, cb, audioCb }: TempoSchedule): number {
		const start = this.convert(time.start, 'note', 'tick');
		const duration = time.duration ? this.convert(time.duration, 'note', 'tick') : undefined;
		const interval = time.interval ? this.convert(time.interval, 'note', 'tick') : undefined;

		return this.schedule(
			new TickEvent({
				start,
				duration,
				interval,
				cb,
				audioCb
			})
		);
	}
	scheduleLoopOnTempo({ time, cb, audioCb }: TempoSchedule): number {
		const start = this.convert(time.start, 'note', 'tick');
		const duration = time.duration ? this.convert(time.duration, 'note', 'tick') : undefined;
		const interval = time.interval ? this.convert(time.interval, 'note', 'tick') : undefined;

		return this.scheduleLoop(
			new TickEvent({
				start,
				duration,
				interval,
				cb,
				audioCb
			})
		);
	}
}
