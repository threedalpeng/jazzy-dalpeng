let debounceTimer: number;
export function debounce(callback, timeout = 1000) {
  clearTimeout(debounceTimer);
  debounceTimer = window.setTimeout(callback, timeout);
}
