export type WithCleanup<C extends (...args: any) => any> = (...args: Parameters<C>) => C | void;
export type DeepPartial<T> = {
	[P in keyof T]?: DeepPartial<T[P]>;
};
