import type { Readable, Writable } from 'svelte/store';

export type WithCleanup<C extends (...args: any) => any> = (...args: Parameters<C>) => C | void;
export type DeepPartial<T> = {
	[P in keyof T]?: DeepPartial<T[P]>;
};

export type WritableProperties<T> = {
	[P in keyof T]: Writable<T[P]>;
};
export type ReadableProperties<T> = {
	[P in keyof T]: Readable<T[P]>;
};
