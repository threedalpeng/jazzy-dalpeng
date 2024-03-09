let debounceTimer: number;
export function debounce(callback: TimerHandler, timeout = 1000) {
	clearTimeout(debounceTimer);
	debounceTimer = window.setTimeout(callback, timeout);
}

export function rangeInt(start: number, end: number) {
	const st = Math.ceil(start);
	const ed = Math.ceil(end);
	return [...Array(ed - st).keys()].map((i) => i + st);
}

interface RangeFloatOptions {
	gap: number;
	quantized: boolean;
}
export function rangeFloat(start: number, end: number, options: Partial<RangeFloatOptions> = {}) {
	const { gap = 1, quantized = false } = options;
	if (!quantized) {
		const size = Math.floor((end - start) / gap);
		console.log([...Array(size).keys()].map((i) => i * gap + start));
		return [...Array(size).keys()].map((i) => i * gap + start);
	} else {
		const st = Math.ceil(start / gap) * gap;
		const ed = Math.ceil(end / gap) * gap;
		const size = Math.floor((ed - st) / gap);
		return [...Array(size).keys()].map((i) => i * gap + st);
	}
}
