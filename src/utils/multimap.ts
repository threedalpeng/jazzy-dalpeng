/** A key can contain several values; iteration returns individual key/value pairs. */
export class MultiMap<K, V> {
	#map = new Map<K, V[]>();
	get size() {
		return this.#map.size;
	}
	clear() {
		this.#map.clear();
	}
	delete(key: K) {
		return this.#map.delete(key);
	}
	getAll(key: K) {
		return this.#map.get(key);
	}
	getFirst(key: K) {
		return this.#map.get(key)?.[0];
	}
	has(key: K) {
		return this.#map.has(key);
	}
	set(key: K, value: V): this {
		const values = this.#map.get(key);
		if (values) values.push(value);
		else this.#map.set(key, [value]);
		return this;
	}
	*[Symbol.iterator](): IterableIterator<[K, V]> {
		yield* this.entries();
	}
	keys() {
		return this.#map.keys();
	}
	*values(): IterableIterator<V> {
		for (const values of this.#map.values()) yield* values;
	}
	*entries(): IterableIterator<[K, V]> {
		for (const [key, values] of this.#map) for (const value of values) yield [key, value];
	}
	forEach(callback: (value: V, key: K, map: MultiMap<K, V>) => void, thisArg?: unknown) {
		for (const [key, value] of this) callback.call(thisArg, value, key, this);
	}
}
