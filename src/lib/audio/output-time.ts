/** Estimate the audio context position currently reaching the output device. */
export function audibleTime(ctx: AudioContext, now = performance.now()) {
	const timestamp = ctx.getOutputTimestamp?.();
	const contextTime = timestamp?.contextTime;
	const performanceTime = timestamp?.performanceTime;
	if (
		typeof contextTime === 'number' &&
		typeof performanceTime === 'number' &&
		Number.isFinite(contextTime) &&
		Number.isFinite(performanceTime) &&
		contextTime > 0 &&
		performanceTime > 0 &&
		now >= performanceTime &&
		now - performanceTime < 1000
	) {
		return Math.max(0, Math.min(ctx.currentTime, contextTime + (now - performanceTime) / 1000));
	}
	// outputLatency is the preferred fallback; do not blindly add both latencies.
	const latency = ctx.outputLatency > 0 ? ctx.outputLatency : ctx.baseLatency || 0;
	return Math.max(0, ctx.currentTime - latency);
}
