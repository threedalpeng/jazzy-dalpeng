import { onFrame } from '#lib/animation/frame.ts';
import { audibleTime } from '#lib/audio/output-time.ts';
import type { WithCleanup } from '#src/utils/types.ts';
import type { ScoreTimestamp } from '../practice/types';
import { TickEvent, type TickEventCallbacks } from './event';
import TimerWorker from './timer-worker?worker';

export interface TickState {
	tickPassed: number;
	/** Scheduled audio-context time in seconds. */
	time: number;
}
export type AudioTickState = { audioCtx: AudioContext; signal: AbortSignal } & TickState;
export type TickCallback = (state: TickState) => unknown;
export type AudioTickCallback = (state: AudioTickState) => unknown;

const LOOKAHEAD_INTERVAL_MS = 25;
const SCHEDULE_AHEAD_SEC = 0.15;
const AUDIO_LEAD_SEC = 0.005;
const MS_PER_MIN = 60000;
type Occurrence = { event: TickEvent; tick: number };
type Cleanup = { end: number; callback: TickCallback };

export class AudioClockTimer {
	audioCtx: AudioContext | null = null;
	lookaheadTimer = new TimerWorker();
	#isRunning = false;
	#starting = false;
	#startVersion = 0;
	#destroyed = false;
	#epoch = 0;
	#scheduledTick = -1;
	#visualTick = -1;
	#tickIntervalMs: number;
	#removeFrame: (() => void) | undefined;
	#events = new Map<number, TickEvent>();
	#audioControllers = new Map<number, AbortController>();
	#loops = new Set<number>();
	#cleanups = new Map<number, Cleanup>();
	#beforeStartCallbacks = new Set<() => Promise<any>>();
	#startCallbacks = new Set<() => any>();
	#stopCallbacks = new Set<() => any>();
	#errorCallbacks = new Set<(error: unknown) => void>();
	#visibility = () => {
		if (document.hidden) this.stop();
	};
	#audioState = () => {
		if (this.#isRunning && this.audioCtx?.state !== 'running') this.stop();
	};

	constructor(tickIntervalMs = 10) {
		if (!Number.isFinite(tickIntervalMs) || tickIntervalMs <= 0)
			throw new RangeError('Tick interval must be positive');
		this.#tickIntervalMs = tickIntervalMs;
		this.lookaheadTimer.postMessage({ interval: LOOKAHEAD_INTERVAL_MS });
		this.lookaheadTimer.addEventListener('message', (event) => {
			if (event.data === 'tick') {
				try {
					this.#onLookahead();
				} catch (error) {
					this.stop();
					this.#errorCallbacks.forEach((callback) => callback(error));
				}
			}
		});
	}
	get currentTime() {
		if (!this.audioCtx) throw new TypeError("Timer hasn't yet started.");
		return this.audioCtx.currentTime;
	}
	get position() {
		const time = this.audioCtx ? audibleTime(this.audioCtx) : 0;
		return {
			time,
			tickPassed: this.#isRunning ? Math.max(-1, this.#tickAt(time)) : -1,
			running: this.#isRunning
		};
	}
	get tickIntervalMs() {
		return this.#tickIntervalMs;
	}
	set tickIntervalMs(value: number) {
		if (!Number.isFinite(value) || value <= 0)
			throw new RangeError('Tick interval must be positive');
		if (value === this.#tickIntervalMs) return;
		const restart = this.#isRunning;
		if (restart) this.stop();
		this.#tickIntervalMs = value;
		if (restart) this.#startInBackground();
	}
	get isRunning() {
		return this.#isRunning;
	}
	#tickAt(time: number) {
		return Math.floor((time - this.#epoch) / (this.#tickIntervalMs / 1000) + 1e-7);
	}
	#state(tick: number): TickState {
		return { tickPassed: tick, time: this.#epoch + (tick * this.#tickIntervalMs) / 1000 };
	}
	async start() {
		if (this.#destroyed || this.#isRunning || this.#starting) return;
		this.#starting = true;
		if (typeof document !== 'undefined')
			document.addEventListener('visibilitychange', this.#visibility);
		const version = ++this.#startVersion;
		try {
			if (!this.audioCtx) {
				this.audioCtx = new AudioContext();
				this.audioCtx.addEventListener?.('statechange', this.#audioState);
			}
			await this.audioCtx.resume();
			if (version !== this.#startVersion || this.#destroyed) return;
			await Promise.all([...this.#beforeStartCallbacks].map((callback) => callback()));
			if (version !== this.#startVersion || this.#destroyed) return;
			if (this.audioCtx.state !== 'running') throw new Error('Audio unavailable');
			if (typeof document !== 'undefined' && document.hidden) {
				this.stop();
				return;
			}
			this.#epoch = this.audioCtx.currentTime + 0.1;
			this.#scheduledTick = this.#visualTick = -1;
			this.#isRunning = true;
			this.#startCallbacks.forEach((callback) => callback());
			if (!this.#isRunning) return;
			this.#onLookahead();
			if (!this.#isRunning) return;
			this.lookaheadTimer.postMessage('start');
			this.#removeFrame = onFrame(this.#updateView);
		} catch (error) {
			if (version !== this.#startVersion || this.#destroyed) return;
			this.stop();
			throw error;
		} finally {
			if (version === this.#startVersion) this.#starting = false;
		}
	}
	#occurrences(from: number, to: number, latestOnly = false): Occurrence[] {
		const occurrences: Occurrence[] = [];
		for (const event of this.#events.values()) {
			if (!this.#loops.has(event.id)) {
				if (event.start > from && event.start <= to) occurrences.push({ event, tick: event.start });
			} else {
				const interval = event.interval!;
				const first = Math.max(0, Math.floor((from - event.start) / interval) + 1);
				const last = Math.floor((to - event.start) / interval);
				for (let index = latestOnly ? Math.max(first, last) : first; index <= last; index++) {
					occurrences.push({ event, tick: event.start + index * interval });
				}
			}
		}
		return occurrences.sort((a, b) => a.tick - b.tick || a.event.id - b.event.id);
	}
	#onLookahead() {
		if (!this.#isRunning || !this.audioCtx) return;
		const ctx = this.audioCtx;
		const to = this.#tickAt(ctx.currentTime + SCHEDULE_AHEAD_SEC);
		// Jump over missed audio instead of bursting past notes after a blocked thread.
		const from = Math.max(this.#scheduledTick, this.#tickAt(ctx.currentTime + AUDIO_LEAD_SEC));
		this.#scheduledTick = to;
		for (const { event, tick } of this.#occurrences(from, to)) {
			if (!this.#isRunning) break;
			if (
				this.#events.has(event.id) &&
				this.#state(tick).time >= ctx.currentTime + AUDIO_LEAD_SEC
			) {
				if (event.audio) {
					let controller = this.#audioControllers.get(event.id);
					if (!controller) {
						controller = new AbortController();
						this.#audioControllers.set(event.id, controller);
					}
					event.audio({ audioCtx: ctx, signal: controller.signal, ...this.#state(tick) });
				}
			}
		}
	}
	#cleanup(id: number, tick: number) {
		const cleanup = this.#cleanups.get(id);
		this.#cleanups.delete(id);
		cleanup?.callback(this.#state(tick));
	}
	#updateView = () => {
		if (!this.#isRunning || !this.audioCtx) return;
		const to = Math.max(this.#visualTick, this.#tickAt(audibleTime(this.audioCtx)));
		if (to < 0 || to === this.#visualTick) return;
		const occurrences = this.#occurrences(this.#visualTick, to, true);
		this.#visualTick = to;
		for (const { event, tick } of occurrences) {
			if (!this.#isRunning) break;
			for (const [id, cleanup] of this.#cleanups)
				if (cleanup.end <= tick) this.#cleanup(id, cleanup.end);
			if (!this.#events.has(event.id)) continue;
			// Expired finite highlights are not replayed when the display catches up.
			if (event.duration && tick + event.duration <= to) continue;
			this.#cleanup(event.id, tick);
			const result = event.animation?.(this.#state(tick));
			const callback = typeof result === 'function' ? (result as TickCallback) : event.cleanup;
			if (callback && this.#isRunning)
				this.#cleanups.set(event.id, { end: tick + (event.duration ?? Infinity), callback });
		}
		for (const [id, cleanup] of this.#cleanups)
			if (cleanup.end <= to) this.#cleanup(id, cleanup.end);
	};
	beforeStart(callback: () => Promise<any>) {
		this.#beforeStartCallbacks.add(callback);
		return () => this.removeBeforeStart(callback);
	}
	removeBeforeStart(callback: () => Promise<any>) {
		this.#beforeStartCallbacks.delete(callback);
	}
	onStart(callback: () => any) {
		this.#startCallbacks.add(callback);
		return () => this.removeStart(callback);
	}
	removeStart(callback: () => any) {
		this.#startCallbacks.delete(callback);
	}
	onError(callback: (error: unknown) => void) {
		this.#errorCallbacks.add(callback);
		return () => this.#errorCallbacks.delete(callback);
	}
	#startInBackground() {
		void this.start().catch((error) => this.#errorCallbacks.forEach((callback) => callback(error)));
	}
	onStop(callback: () => any) {
		this.#stopCallbacks.add(callback);
		return () => this.removeStop(callback);
	}
	removeStop(callback: () => any) {
		this.#stopCallbacks.delete(callback);
	}
	schedule(event: TickEvent) {
		this.#events.set(event.id, event);
		return event.id;
	}
	scheduleLoop(event: TickEvent) {
		if (!Number.isInteger(event.interval) || event.interval! <= 0)
			throw new RangeError('Loop interval must be a positive tick count');
		this.#events.set(event.id, event);
		this.#loops.add(event.id);
		return event.id;
	}
	cancelSchedule(id: number) {
		this.#audioControllers.get(id)?.abort();
		this.#audioControllers.delete(id);
		this.#cleanup(id, Math.max(0, this.#visualTick));
		this.#events.delete(id);
		this.#loops.delete(id);
	}
	stop() {
		this.#startVersion++;
		const active = this.#isRunning || this.#starting;
		this.#starting = false;
		this.#isRunning = false;
		this.#removeFrame?.();
		this.#removeFrame = undefined;
		if (typeof document !== 'undefined')
			document.removeEventListener('visibilitychange', this.#visibility);
		this.lookaheadTimer.postMessage('stop');
		for (const controller of this.#audioControllers.values()) controller.abort();
		this.#audioControllers.clear();
		for (const id of [...this.#cleanups.keys()]) this.#cleanup(id, Math.max(0, this.#visualTick));
		this.#scheduledTick = this.#visualTick = -1;
		if (active) this.#stopCallbacks.forEach((callback) => callback());
	}
	toggle() {
		if (this.#isRunning) this.stop();
		else this.#startInBackground();
	}
	restart() {
		if (this.#isRunning) {
			this.stop();
			this.#startInBackground();
		}
	}
	destroy() {
		if (this.#destroyed) return;
		this.stop();
		this.#destroyed = true;
		this.lookaheadTimer.terminate();
		this.audioCtx?.removeEventListener?.('statechange', this.#audioState);
		void this.audioCtx?.close();
		this.#events.clear();
		this.#loops.clear();
		this.#beforeStartCallbacks.clear();
		this.#startCallbacks.clear();
		this.#stopCallbacks.clear();
		this.#errorCallbacks.clear();
	}
}

type TimeUnit = 'tick' | 'note' | 'beat' | 'bar' | 'second' | 'millisecond';
export interface TempoSchedule {
	time: ScoreTimestamp;
	animation?: WithCleanup<TickCallback>;
	audio?: AudioTickCallback;
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
		if (!Number.isFinite(value) || value <= 0) throw new RangeError('Invalid bpm');
		this.#bpm = value;
		this.#updateTickInterval();
	}

	#ticksPerNote = 192;
	get ticksPerNote() {
		return this.#ticksPerNote;
	}
	set ticksPerNote(value: number) {
		if (!Number.isFinite(value) || value <= 0 || !Number.isInteger(value))
			throw new RangeError('Invalid ticksPerNote');
		this.#ticksPerNote = value;
		this.#updateTickInterval();
	}
	#beatPerBar: number = 6;
	get beatPerBar() {
		return this.#beatPerBar;
	}
	set beatPerBar(value: number) {
		if (!Number.isFinite(value) || value <= 0 || !Number.isInteger(value))
			throw new RangeError('Invalid beatPerBar');
		this.#beatPerBar = value;
		this.#updateTickInterval();
	}

	#signatureUnit: number = 8;
	get signatureUnit() {
		return this.#signatureUnit;
	}
	set signatureUnit(value: number) {
		if (!Number.isFinite(value) || value <= 0 || !Number.isInteger(value))
			throw new RangeError('Invalid signatureUnit');
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
				return (ticks * this.#signatureUnit) / this.#ticksPerNote;
			case 'bar':
				return (ticks * this.#signatureUnit) / (this.#ticksPerNote * this.#beatPerBar);
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

	scheduleOnTempo({ time, animation, audio }: TempoSchedule): number {
		const start = this.convert(time.start, 'note', 'tick');
		const duration = time.duration ? this.convert(time.duration, 'note', 'tick') : undefined;
		const interval = time.interval ? this.convert(time.interval, 'note', 'tick') : undefined;

		const callbacks: Partial<TickEventCallbacks> = {
			animation: animation
				? (state) => {
						callbacks.cleanup = animation(state) ?? undefined;
					}
				: undefined,
			audio
		};

		return this.schedule(
			new TickEvent({
				time: { start, duration, interval },
				callbacks
			})
		);
	}
	scheduleLoopOnTempo({ time, animation, audio }: TempoSchedule): number {
		const start = this.convert(time.start, 'note', 'tick');
		const duration = time.duration ? this.convert(time.duration, 'note', 'tick') : undefined;
		const interval = time.interval ? this.convert(time.interval, 'note', 'tick') : undefined;

		return this.scheduleLoop(
			new TickEvent({
				time: { start, duration, interval },
				callbacks: {
					animation,
					audio
				}
			})
		);
	}
}
