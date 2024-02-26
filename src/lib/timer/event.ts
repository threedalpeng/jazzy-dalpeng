import type { ScoreTimestamp } from '../practice/types';
import { MAX_TICK_SIZE } from './constant';
import { type AudioTickCallback, type TickCallback } from './tick';

export type TickTimestamp = ScoreTimestamp;
export interface TickEventCallbacks {
	audio: AudioTickCallback;
	animation: TickCallback;
	cleanup: TickCallback;
}

export interface TickEventOption {
	time: TickTimestamp;
	callbacks?: Partial<TickEventCallbacks>;
}

export class TickEvent {
	static #currentId = 0;
	static get #nextId() {
		return this.#currentId++;
	}

	#id: number;
	get id() {
		return this.#id;
	}

	#time: TickTimestamp;

	get start() {
		return this.#time.start;
	}

	get interval() {
		return this.#time.interval;
	}

	get duration() {
		return this.#time.duration;
	}

	#callbacks?: Partial<TickEventCallbacks>;
	get callbacks() {
		return this.#callbacks;
	}
	get animation() {
		return this.#callbacks?.animation;
	}
	get cleanup() {
		return this.#callbacks?.cleanup;
	}
	get audio() {
		return this.#callbacks?.audio;
	}
	constructor({ time, callbacks }: TickEventOption) {
		if (time.start < 0 || MAX_TICK_SIZE <= time.start + (time.duration ?? 0)) {
			throw RangeError('tick out of range');
		}
		if (!callbacks?.audio && !callbacks?.animation) {
			throw TypeError('either audio or animation callback should be defined');
		}
		this.#id = TickEvent.#nextId;
		this.#time = time;
		this.#callbacks = callbacks;
	}
}
