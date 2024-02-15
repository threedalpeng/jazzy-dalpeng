export type ShuffleMode = 'each-turn' | 'all-done';

export interface RandomBoxOption {
	shuffleMode: ShuffleMode;
}

export class RandomBox<T> {
	constructor(items: T[], options: Partial<RandomBoxOption> = {}) {
		const { shuffleMode = 'all-done' } = options;
		this.#items = items;
		this.#shuffleMode = shuffleMode;
		this.init();
	}
	init() {
		this.#remains = new Set(new Array(this.#items.length).keys());
	}

	#shuffleMode: ShuffleMode;
	get shuffleMode() {
		return this.#shuffleMode;
	}
	set shuffleMode(mode: ShuffleMode) {
		this.#shuffleMode = mode;
		this.init();
	}

	#items: T[] = [];
	#indexSelected: number = -1;
	#remains: Set<number> = new Set<number>();
	get remains() {
		if (this.#shuffleMode === 'each-turn') {
			return [...this.#remains].filter((n) => n !== this.#indexSelected).map((n) => this.#items[n]);
		} else {
			return [...this.#remains].map((n) => this.#items[n]);
		}
	}

	static getRandomInt(min: number, max: number) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min)) + min;
	}

	open() {
		let selected: T;
		switch (this.shuffleMode) {
			case 'each-turn':
				this.#indexSelected = RandomBox.getRandomInt(0, this.#items.length);
				selected = this.#items[this.#indexSelected];
				break;
			case 'all-done':
				if (this.#remains.size === 0) {
					this.init();
				}
				this.#indexSelected = [...this.#remains][RandomBox.getRandomInt(0, this.#remains.size)];
				selected = this.#items[this.#indexSelected];
				this.#remains.delete(this.#indexSelected);
				console.log([...this.#remains]);
				break;
		}
		return selected;
	}

	destroy() {
		this.#remains.clear();
	}
}
