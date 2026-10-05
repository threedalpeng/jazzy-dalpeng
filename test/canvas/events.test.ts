import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CanvasEventHandler, type OnHitCallback } from '../../src/lib/canvas/core/events';

let color: number[];
let handler: CanvasEventHandler;
let target: any;
let onHit: ReturnType<typeof vi.fn<OnHitCallback>>;
function send(type: string, x = 10, y = 20) {
	handler.handleEvent({
		type,
		currentTarget: target,
		clientX: x,
		clientY: y,
		pointerId: 1,
		pointerType: 'mouse',
		button: 0,
		cancelable: true,
		preventDefault: vi.fn()
	} as any);
}
beforeEach(() => {
	color = [0, 0, 1, 255];
	vi.stubGlobal(
		'OffscreenCanvas',
		class {
			constructor(
				public width: number,
				public height: number
			) {}
			getContext() {
				return { canvas: this, getImageData: () => ({ data: color }), clearRect: vi.fn() };
			}
		}
	);
	handler = new CanvasEventHandler();
	handler.setup(100, 100);
	target = {
		width: 100,
		height: 100,
		getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 100 }),
		setPointerCapture: vi.fn()
	};
	onHit = vi.fn();
	handler.onHitboxRender('#000001', () => {}, onHit);
});
afterEach(() => vi.unstubAllGlobals());

describe('canvas pointer input', () => {
	it('retains a complete click between two frames and reports its coordinates', () => {
		send('pointerdown');
		send('pointerup');
		handler.poll();
		expect(onHit.mock.calls.map(([ev]) => ev.type)).toEqual(['over', 'down', 'up', 'click']);
		expect(onHit.mock.calls[1][0].detail).toMatchObject({
			position: { x: 10, y: 20 },
			state: { 0: 'pressed' }
		});
	});
	it('cancels a captured press without generating a click', () => {
		send('pointerdown');
		send('pointercancel');
		send('pointerup');
		handler.poll();
		expect(onHit.mock.calls.map(([ev]) => ev.type)).toContain('cancel');
		expect(onHit.mock.calls.map(([ev]) => ev.type)).not.toContain('click');
	});
	it('does not interpret a drag as a click', () => {
		send('pointerdown');
		send('pointermove', 30);
		send('pointerup', 30);
		handler.poll();
		expect(onHit.mock.calls.map(([ev]) => ev.type)).not.toContain('click');
	});
	it('synchronizes the hit surface when dimensions change', () => {
		handler.resize(200, 80);
		expect(handler.context2d.canvas.width).toBe(200);
		expect(handler.context2d.canvas.height).toBe(80);
	});
	it('clearing a child does not delete sibling callbacks', () => {
		const child = new CanvasEventHandler();
		child.registerOnHitMap(handler);
		child.onHitboxRender('#000002', () => {}, vi.fn());
		child.clear();
		send('pointerdown');
		handler.poll();
		expect(onHit).toHaveBeenCalled();
	});
	it('ignores partially transparent pixels and out-of-bounds positions', () => {
		color = [0, 0, 1, 100];
		send('pointerdown');
		send('pointerup');
		send('pointerdown', -1);
		handler.poll();
		expect(onHit).not.toHaveBeenCalled();
	});
});

it('rounds fractional logical hit dimensions without reallocating each frame', () => {
	handler.resize(100.2, 80.1);
	const canvas = handler.context2d.canvas;
	expect([canvas.width, canvas.height]).toEqual([101, 81]);
	const setWidth = vi.fn();
	Object.defineProperty(canvas, 'width', { get: () => 101, set: setWidth });
	handler.resize(100.2, 80.1);
	expect(setWidth).not.toHaveBeenCalled();
});
