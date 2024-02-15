let timerId: number;
let interval = 100;

self.onmessage = function (e) {
	if (e.data == 'start') {
		timerId = self.setInterval(() => {
			self.postMessage('tick');
		}, interval);
	} else if (e.data.interval) {
		interval = e.data.interval;
		if (timerId < 0) {
			clearInterval(timerId);
			timerId = self.setInterval(() => {
				self.postMessage('tick');
			}, interval);
		}
	} else if (e.data == 'stop') {
		self.clearInterval(timerId);
		timerId = -1;
	}
};
