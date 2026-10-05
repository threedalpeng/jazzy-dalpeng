import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { CanvasContext } from '../../src/lib/canvas/core/context';
let canvas: any;
let ctx: any;
beforeEach(() => {
	ctx = { clearRect: vi.fn(), save: vi.fn(), restore: vi.fn() };
	canvas = {
		width: 100,
		height: 50,
		dataset: {},
		getContext: () => ctx,
		addEventListener: vi.fn(),
		removeEventListener: vi.fn()
	};
	vi.stubGlobal(
		'OffscreenCanvas',
		class {
			constructor(
				public width: number,
				public height: number
			) {}
			getContext() {
				return { ...ctx, canvas: this };
			}
		}
	);
	vi.stubGlobal(
		'requestAnimationFrame',
		vi.fn(() => 1)
	);
	vi.stubGlobal('cancelAnimationFrame', vi.fn());
});
afterEach(() => vi.unstubAllGlobals());
it('reports frame intervals and resizes hit detection with its canvas', () => {
	const context = new CanvasContext(() => canvas);
	context.render(100);
	expect(context.delta).toBe(0);
	canvas.width = 200;
	context.render(116);
	expect(context.delta).toBe(16);
	expect(context.hitContext2d.canvas.width).toBe(200);
	context.quit();
});
it('starting twice schedules one loop and quitting removes every listener', () => {
	const context = new CanvasContext(() => canvas);
	context.run();
	context.run();
	expect(requestAnimationFrame).toHaveBeenCalledTimes(1);
	context.quit();
	expect(canvas.removeEventListener.mock.calls).toEqual(canvas.addEventListener.mock.calls);
	expect(cancelAnimationFrame).toHaveBeenCalledWith(1);
});
it('restores the drawing state even when a renderer throws', () => {
	const context = new CanvasContext(() => canvas);
	context.onRender(() => {
		throw new Error('bad renderer');
	});
	expect(() => context.render(0)).toThrow('bad renderer');
	expect(ctx.restore).toHaveBeenCalledTimes(1);
	context.quit();
});

it('renders dense pixels while retaining logical drawing and hit coordinates', () => {
	ctx.setTransform = vi.fn();
	let scale = 2;
	const context = new CanvasContext(
		() => canvas,
		() => ({ width: 100, height: 50, scale })
	);
	context.render(0);
	expect([canvas.width, canvas.height]).toEqual([200, 100]);
	expect([context.width, context.height]).toEqual([100, 50]);
	expect([context.hitContext2d.canvas.width, context.hitContext2d.canvas.height]).toEqual([
		100, 50
	]);
	expect(ctx.setTransform).toHaveBeenLastCalledWith(2, 0, 0, 2, 0, 0);
	scale = 3;
	context.render(16);
	expect([canvas.width, canvas.height]).toEqual([300, 150]);
	expect(ctx.setTransform).toHaveBeenLastCalledWith(3, 0, 0, 3, 0, 0);
	context.quit();
});

it('samples dimensions once per frame and shares the frame time with callbacks', () => {
	ctx.setTransform = vi.fn();
	const dimensions = vi.fn(() => ({ width: 100, height: 50, scale: 2 }));
	const context = new CanvasContext(() => canvas, dimensions);
	context.onRender((frame) => {
		expect([frame.width, frame.height, frame.pixelScale, frame.frameTime]).toEqual([
			100, 50, 2, 100
		]);
	});
	context.render(100);
	expect(dimensions).toHaveBeenCalledTimes(1);
	context.quit();
});

it('interleaves direct hit regions with nested compositing in painter order', () => {
	const operations: string[] = [];
	const context = new CanvasContext(() => canvas);
	context.onRender(() => operations.push('back visible'));
	context.onHitboxRender('#000001', () => operations.push('back hit'), vi.fn());
	context.onRender(() => operations.push('child visible + hit'));
	context.onRender(() => operations.push('front visible'));
	context.onHitboxRender('#000002', () => operations.push('front hit'), vi.fn());
	context.render(0);
	expect(operations).toEqual([
		'back visible',
		'back hit',
		'child visible + hit',
		'front visible',
		'front hit'
	]);
	context.quit();
});

it('retains declaration order even when mount registration order differs', () => {
	const operations: number[] = [];
	const context = new CanvasContext(() => canvas);
	const first = context.reserveOrder();
	const second = context.reserveOrder();
	context.onRender(() => operations.push(2), second);
	context.onRender(() => operations.push(1), first);
	context.render(0);
	expect(operations).toEqual([1, 2]);
	context.quit();
});

it('reuses cached surfaces but redraws after key, scale, size, or callback changes', () => {
	ctx.setTransform = vi.fn();
	let width = 100;
	let scale = 2;
	const context = new CanvasContext(
		() => canvas,
		() => ({ width, height: 50, scale })
	);
	const draw = vi.fn();
	context.onRender(draw);
	context.render(0, { key: 'a' });
	context.render(16, { key: 'a' });
	expect(draw).toHaveBeenCalledTimes(1);
	expect(context.delta).toBe(16);
	context.render(32, { key: 'b' });
	scale = 3;
	context.render(48, { key: 'b' });
	width = 110;
	context.render(64, { key: 'b' });
	context.invalidate();
	context.render(80, { key: 'b' });
	expect(draw).toHaveBeenCalledTimes(5);
	context.removeRender(draw);
	context.render(96, { key: 'b' });
	expect(draw).toHaveBeenCalledTimes(5);
	expect(ctx.clearRect).toHaveBeenCalledTimes(12); // Visible + hit surfaces per redraw.
	context.quit();
});

it('propagates child invalidation to a cached parent', () => {
	const parent = new CanvasContext(() => canvas);
	const child = new CanvasContext(() => canvas);
	parent.registerSubroutineContext(child);
	const draw = vi.fn();
	parent.onRender(draw);
	parent.render(0, { key: null });
	parent.render(16, { key: null });
	child.invalidate();
	parent.render(32, { key: null });
	expect(draw).toHaveBeenCalledTimes(2);
	child.quit();
	parent.quit();
});

it('rejects ambiguous writes to provider-managed dimensions', () => {
	const context = new CanvasContext(
		() => canvas,
		() => ({ width: 100, height: 50, scale: 2 })
	);
	expect(() => {
		context.width = 80;
	}).toThrow('dimensions provider');
	expect(() => {
		context.height = 80;
	}).toThrow('dimensions provider');
});
