let timerId: ReturnType<typeof setInterval> | undefined;
let interval = 25;
function stop() {
	if (timerId !== undefined) clearInterval(timerId);
	timerId = undefined;
}
function start() {
	stop();
	timerId = setInterval(() => self.postMessage('tick'), interval);
}
self.onmessage = ({ data }) => {
	if (data === 'start') start();
	else if (data === 'stop') stop();
	else if (
		typeof data?.interval === 'number' &&
		Number.isFinite(data.interval) &&
		data.interval > 0
	) {
		interval = data.interval;
		if (timerId !== undefined) start();
	}
};
