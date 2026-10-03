import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { CanvasContext } from '../../src/lib/canvas/core/context';
let canvas: any;
let ctx: any;
beforeEach(() => {
	ctx = { clearRect: vi.fn(), save: vi.fn(), restore: vi.fn() };
	canvas = {
		width: 100,
		height: 50,
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
