import { getContext, onDestroy, onMount, setContext } from 'svelte';
import { mouseBasedEventTypes } from './hit-test';

export type CanvasGetter = () => HTMLCanvasElement;
export type CanvasRenderCallback = (canvasContext: CanvasContext) => any;
export type OffscreenCanvasRenderCallback = (ctx: OffscreenCanvasRenderingContext2D) => any;
export class CanvasContext {
	registerSubroutineContext(subContext: CanvasContext) {
		subContext.setup();
		// subContext.#hitRenderMap = this.#hitRenderMap;
		subContext.#onHitMap = this.#onHitMap;
	}
	#canvasGetter: CanvasGetter;
	#timePassed = 0;
	#frameId = 0;
	#hitTestCanvas: OffscreenCanvas | null = null;
	constructor(canvasGetter: CanvasGetter) {
		this.#canvasGetter = canvasGetter;
	}

	get canvas() {
		return this.#canvasGetter();
	}
	get context2d() {
		return this.canvas.getContext('2d')!!;
	}
	get hitContext2d() {
		return this.#hitTestCanvas!!.getContext('2d', { alpha: false, willReadFrequently: true })!!;
	}
	get delta() {
		return this.#timePassed;
	}

	get width() {
		return this.canvas.width;
	}
	set width(w) {
		this.canvas.width = w;
	}
	get height() {
		return this.canvas.height;
	}
	set height(h) {
		this.canvas.height = h;
	}

	#setupCallbacks: Set<CanvasRenderCallback> = new Set();
	onSetup(callback: CanvasRenderCallback) {
		this.#setupCallbacks.add(callback);
	}
	removeSetup(callback: CanvasRenderCallback) {
		this.#setupCallbacks.delete(callback);
	}

	#renderCallbacks: Set<CanvasRenderCallback> = new Set();
	onRender(callback: CanvasRenderCallback) {
		this.#renderCallbacks.add(callback);
	}
	removeRender(callback: CanvasRenderCallback) {
		this.#renderCallbacks.delete(callback);
	}

	#afterRenderCallbacks: Set<CanvasRenderCallback> = new Set();
	onAfterRender(callback: CanvasRenderCallback) {
		this.#afterRenderCallbacks.add(callback);
	}
	removeAfterRender(callback: CanvasRenderCallback) {
		this.#afterRenderCallbacks.delete(callback);
	}

	#hitRenderMap: Map<string, (ctx: OffscreenCanvasRenderingContext2D) => any> = new Map();
	#onHitMap: Map<string, (ev: MouseEvent) => any> = new Map();
	onHitboxRender(
		code: string,
		renderFn: (ctx: OffscreenCanvasRenderingContext2D) => any,
		onHit: (ev: MouseEvent) => any
	) {
		this.#hitRenderMap.set(code, renderFn);
		this.#onHitMap.set(code, onHit);
	}
	removeHitboxRender(code: string) {
		this.#hitRenderMap.delete(code);
		this.#onHitMap.delete(code);
	}

	handleMouseEvent(ev: MouseEvent) {
		const bounding = this.canvas.getBoundingClientRect();
		const [r, g, b] = this.hitContext2d.getImageData(
			ev.clientX - bounding.left,
			ev.clientY - bounding.top,
			1,
			1
		).data;
		const code = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
		const onHit = this.#onHitMap.get(code);
		if (onHit !== undefined) {
			onHit(ev);
		}
	}

	render: FrameRequestCallback = async (t) => {
		this.#timePassed = t;
		let ctx = this.context2d;
		let hitCtx = this.hitContext2d;

		ctx.clearRect(0, 0, this.width, this.height);
		hitCtx.clearRect(0, 0, this.width, this.height);
		this.#renderCallbacks.forEach(async (renderCallback) => {
			ctx.save();
			renderCallback(this);
			ctx.restore();
		});
		this.#hitRenderMap.forEach(async (renderCallback) => {
			hitCtx.save();
			renderCallback(hitCtx);
			hitCtx.restore();
		});
		this.#afterRenderCallbacks.forEach(async (afterRenderCallback) => {
			ctx.save();
			afterRenderCallback(this);
			ctx.restore();
		});
	};

	testCanvas: HTMLCanvasElement | undefined;
	setup() {
		const canvas = this.canvas;
		console.log('setup');
		this.#hitTestCanvas = new OffscreenCanvas(canvas.width, canvas.height);
		// this.testCanvas = document.createElement('canvas');
		// this.testCanvas.width = canvas.width;
		// this.testCanvas.height = canvas.height;
		// document.body.appendChild(this.testCanvas);
		mouseBasedEventTypes.forEach((evtype) =>
			canvas.addEventListener(evtype, this.handleMouseEvent.bind(this))
		);

		this.#setupCallbacks.forEach(async (setupCallback) => {
			setupCallback(this);
		});
	}

	run() {
		this.setup();
		const loop: FrameRequestCallback = async (t) => {
			this.render(t);

			// this.testCanvas
			// 	?.getContext('bitmaprenderer')
			// 	?.transferFromImageBitmap(this.#hitTestCanvas!.transferToImageBitmap());

			this.#frameId = requestAnimationFrame(loop);
		};
		this.#frameId = requestAnimationFrame(loop);
	}

	quit() {
		window.cancelAnimationFrame(this.#frameId);
		this.#renderCallbacks.clear();
		this.#afterRenderCallbacks.clear();
		this.#hitRenderMap.clear();
		this.#onHitMap.clear();
	}
}
