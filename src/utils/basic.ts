let debounceTimer: number;
export function debounce(callback: TimerHandler, timeout = 1000) {
	clearTimeout(debounceTimer);
	debounceTimer = window.setTimeout(callback, timeout);
}

export function range(start: number, end: number) {
	return [...Array(end - start).keys()].map((i) => i + start);
}
