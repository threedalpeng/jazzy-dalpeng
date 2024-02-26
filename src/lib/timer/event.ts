import { MAX_TICK_SIZE } from './constant';
import { type AudioTickCallback, type TickCallback } from './tick';

export interface TickEventOption {
	start: number;
	interval?: number;
	duration?: number;
	audioCb?: AudioTickCallback;
	cb?: TickCallback;
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

	#start: number;
	get start() {
		return this.#start;
	}

	#interval?: number;
	get interval() {
		return this.#interval;
	}

	#duration?: number;
	get duration() {
		return this.#duration;
	}

	#cb?: TickCallback;
	get cb() {
		return this.#cb;
	}
	#audioCb: AudioTickCallback | undefined;
	get audioCb() {
		return this.#audioCb;
	}
	constructor({ start, interval, duration, audioCb, cb }: TickEventOption) {
		if (start < 0 || MAX_TICK_SIZE <= start) {
			throw RangeError('tick out of range');
		}
		if (!audioCb && !cb) {
			throw TypeError('either audioCb or cb should be defined');
		}
		this.#id = TickEvent.#nextId;
		this.#start = start;
		this.#interval = interval;
		this.#duration = duration;
		this.#audioCb = audioCb;
		this.#cb = cb;
	}
}
