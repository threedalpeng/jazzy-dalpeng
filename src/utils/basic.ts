let debounceTimer: number;
export function debounce(callback: TimerHandler, timeout = 1000) {
	clearTimeout(debounceTimer);
	debounceTimer = window.setTimeout(callback, timeout);
}
