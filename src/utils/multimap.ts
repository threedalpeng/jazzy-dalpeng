class MultiMap<K, V> extends Map {
	clear(): void {
		super.clear();
	}
	delete(key: K): boolean {
		return super.delete(key);
	}
	getAll(key: K): V[] | undefined {
		return super.get(key);
	}
	getFirst(key: K): V | undefined {
		const values = super.get(key);
		return values ? values[0] : undefined;
	}
	has(key: K): boolean {
		return super.has(key);
	}
	set(key: K, value: V): this {
		let values = super.get(key);
		if (values === undefined) {
			values = [];
			super.set(key, values);
		}
		values.push(value);
		return this;
	}
	*[Symbol.iterator](): IterableIterator<[K, V]> {
		for (const [k, values] of super[Symbol.iterator]()) {
			for (const v of values) {
				yield [k, v];
			}
		}
	}
	*keys(): IterableIterator<K> {
		for (const k of super.keys()) {
			yield k;
		}
	}
	*values(): IterableIterator<V> {
		for (const values of super.values()) {
			for (const v of values) {
				yield v;
			}
		}
	}
	*entries(): IterableIterator<[K, V[]]> {
		for (const [k, values] of super[Symbol.iterator]()) {
			for (const v of values) {
				yield [k, v];
			}
		}
	}
	forEach(callbackfn: (value: V, key: K, map: Map<K, V[]>) => void, thisArg?: any): void {
		super.forEach((k, values, map) => {
			values.forEach((v: V) => {
				callbackfn(v, k, map);
			});
		}, thisArg);
	}
}
