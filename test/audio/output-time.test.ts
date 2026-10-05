import { expect, it } from 'vitest';
import { audibleTime } from '../../src/lib/audio/output-time';
it('maps output timestamps to performance time and clamps extrapolation', () => {
	const ctx = {
		currentTime: 5,
		getOutputTimestamp: () => ({ contextTime: 4.8, performanceTime: 1000 })
	} as AudioContext;
	expect(audibleTime(ctx, 1050)).toBeCloseTo(4.85);
	expect(audibleTime(ctx, 1500)).toBe(5);
});
it('uses output latency as an approximate fallback without double-counting base latency', () => {
	const ctx = { currentTime: 2, baseLatency: 0.02, outputLatency: 0.04 } as AudioContext;
	expect(audibleTime(ctx, 1000)).toBeCloseTo(1.96);
	Object.assign(ctx, { getOutputTimestamp: () => ({ contextTime: 0, performanceTime: 0 }) });
	expect(audibleTime(ctx, 1000)).toBeCloseTo(1.96);
	Object.assign(ctx, { outputLatency: 0 });
	expect(audibleTime(ctx, 1000)).toBeCloseTo(1.98);
});
