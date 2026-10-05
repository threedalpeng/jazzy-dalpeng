import { expect, test } from '@playwright/test';

test('reference tones produce a signal, paint in the same frame, and cancel queued sound on stop', async ({
	page
}) => {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	await page.addInitScript(() => {
		const audit = {
			starts: [] as { time: number; now: number }[],
			stops: [] as { time: number; start: number }[],
			paints: [] as { index: string; time: number }[],
			changes: [] as { index: string; time: number }[],
			analysers: [] as AnalyserNode[],
			context: null as AudioContext | null
		};
		Object.assign(window, { audioAudit: audit });
		const Original = window.AudioContext;
		window.AudioContext = class extends Original {
			constructor(...args: ConstructorParameters<typeof AudioContext>) {
				super(...args);
				audit.context = this;
			}
			createOscillator() {
				const node = super.createOscillator();
				const start = node.start.bind(node),
					stop = node.stop.bind(node);
				let scheduled = 0;
				node.start = (time = 0) => {
					scheduled = time;
					audit.starts.push({ time, now: this.currentTime });
					start(time);
				};
				node.stop = (time = 0) => {
					audit.stops.push({ time, start: scheduled });
					stop(time);
				};
				return node;
			}
			createGain() {
				const node = super.createGain(),
					connect = node.connect.bind(node);
				node.connect = ((destination: AudioNode) => {
					if (destination === this.destination) {
						const analyser = this.createAnalyser();
						connect(analyser);
						audit.analysers.push(analyser);
					}
					return connect(destination);
				}) as typeof node.connect;
				return node;
			}
		};
		const clear = CanvasRenderingContext2D.prototype.clearRect;
		let previous = '';
		CanvasRenderingContext2D.prototype.clearRect = function (...args) {
			if (this.canvas instanceof HTMLCanvasElement && this.canvas.isConnected) {
				const index = this.canvas.closest('[data-active-note]')?.getAttribute('data-active-note');
				if (index && index !== 'null' && index !== previous && audit.context) {
					previous = index;
					audit.paints.push({ index, time: audit.context.currentTime });
				}
			}
			return clear.apply(this, args);
		};
		new MutationObserver((records) => {
			for (const record of records) {
				const index = (record.target as HTMLElement).getAttribute('data-active-note');
				if (index && index !== 'null' && audit.context)
					audit.changes.push({ index, time: audit.context.currentTime });
			}
		}).observe(document, {
			subtree: true,
			attributes: true,
			attributeFilter: ['data-active-note']
		});
	});
	await page.goto('/jazzy-dalpeng/learn/major-scale/');
	await page.getByRole('button', { name: '스케일 듣기' }).click();
	const rms = () =>
		page.evaluate(() => {
			const audit = (window as any).audioAudit;
			return Math.max(
				0,
				...audit.analysers.map((analyser: AnalyserNode) => {
					const values = new Float32Array(analyser.fftSize);
					analyser.getFloatTimeDomainData(values);
					return Math.sqrt(values.reduce((sum, v) => sum + v * v, 0) / values.length);
				})
			);
		});
	await expect.poll(rms).toBeGreaterThan(0.001);
	await expect
		.poll(() => page.evaluate(() => (window as any).audioAudit.paints.length))
		.toBeGreaterThan(0);
	// Wait until the next note is reserved ahead of its start, then stop it.
	await expect
		.poll(
			() =>
				page.evaluate(() => {
					const audit = (window as any).audioAudit;
					return (
						audit.starts.length > 1 &&
						audit.starts.some((s: { time: number }) => s.time > audit.context.currentTime + 0.04)
					);
				}),
			{ intervals: [10] }
		)
		.toBe(true);
	await page.getByRole('button', { name: '재생 정지' }).click();
	await expect.poll(rms).toBeLessThan(0.001);
	const result = await page.evaluate(() => {
		const a = (window as any).audioAudit;
		return {
			starts: a.starts,
			cancelled: a.stops.some((s: { time: number; start: number }) => s.time < s.start),
			frameGaps: a.paints.map((p: { index: string; time: number }) => {
				const change = a.changes.find((c: { index: string }) => c.index === p.index);
				return change ? Math.abs(change.time - p.time) * 1000 : 0;
			})
		};
	});
	expect(result.cancelled).toBe(true);
	expect(result.starts.every((s: { time: number; now: number }) => s.time >= s.now)).toBe(true);
	expect(Math.max(...result.frameGaps)).toBeLessThan(10);
	expect(errors).toEqual([]);
});

test('late scheduler wakes skip past notes and resume the current timeline', async ({ page }) => {
	await page.goto('/jazzy-dalpeng/');
	const result = await page.evaluate(async (modulePath) => {
		const { TempoTimer } = await import(modulePath);
		const timer = new TempoTimer();
		timer.timeSignature = { upper: 4, lower: 4 };
		timer.bpm = 500;
		const audio: { time: number; now: number }[] = [];
		const visual: number[] = [];
		timer.scheduleLoopOnTempo({
			time: { start: 0, interval: 0.25 },
			audio: ({ time, audioCtx }: { time: number; audioCtx: AudioContext }) =>
				audio.push({ time, now: audioCtx.currentTime }),
			animation: ({ tickPassed }: { tickPassed: number }) => visual.push(tickPassed)
		});
		try {
			await timer.start();
			await new Promise((resolve) => setTimeout(resolve, 50));
			const end = performance.now() + 350;
			while (performance.now() < end) {
				/* Simulate a blocked UI thread. */
			}
			await new Promise((resolve) => setTimeout(resolve, 120));
			return { audio, visual, running: timer.isRunning };
		} finally {
			timer.destroy();
		}
	}, `/jazzy-dalpeng/@fs${process.cwd()}/src/lib/timer/tick.ts`);
	expect(result.running).toBe(true);
	expect(result.audio.length).toBeGreaterThan(1);
	expect(
		result.audio.every((event: { time: number; now: number }) => event.time >= event.now)
	).toBe(true);
	expect(result.visual.at(-1)).toBeGreaterThan(48);
});
