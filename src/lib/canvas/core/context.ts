import { CanvasEventHandler, pointerEventTypes, type OnHitCallback } from './hit-test';

export type CanvasGetter = () => HTMLCanvasElement;
export type CanvasRenderCallback = (canvasContext: CanvasContext) => any;
export type OffscreenCanvasRenderCallback = (ctx: OffscreenCanvasRenderingContext2D) => any;
export class CanvasContext {
	#canvasGetter: CanvasGetter;
	#timePassed = 0;
	#frameId = 0;
	#eventHandler = new CanvasEventHandler();
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
		return this.#eventHandler.context2d;
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
		console.log(callback);
		this.#afterRenderCallbacks.add(callback);
	}
	removeAfterRender(callback: CanvasRenderCallback) {
		this.#afterRenderCallbacks.delete(callback);
	}

	onHitboxRender(
		code: string,
		renderFn: (ctx: OffscreenCanvasRenderingContext2D) => any,
		onHit: OnHitCallback
	) {
		this.#eventHandler.onHitboxRender(code, renderFn, onHit);
	}
	removeHitboxRender(code: string) {
		this.#eventHandler.removeHitboxRender(code);
	}

	registerSubroutineContext(subContext: CanvasContext) {
		subContext.setup();
		subContext.#eventHandler.registerOnHitMap(this.#eventHandler);
	}

	testCanvas: HTMLCanvasElement | undefined;
	setup() {
		const canvas = this.canvas;
		this.#eventHandler.setup(this.canvas.width, this.canvas.height);

		// this.testCanvas = document.createElement('canvas');
		// this.testCanvas.width = canvas.width;
		// this.testCanvas.height = canvas.height;
		// document.body.appendChild(this.testCanvas);

		pointerEventTypes.forEach((evtype) => canvas.addEventListener(evtype, this.#eventHandler));
		this.#setupCallbacks.forEach(async (setupCallback) => {
			setupCallback(this);
		});
	}

	render: FrameRequestCallback = async (t) => {
		this.#timePassed = t;
		let ctx = this.context2d;

		ctx.clearRect(0, 0, this.width, this.height);
		this.#eventHandler.beforeRender();

		this.#renderCallbacks.forEach(async (renderCallback) => {
			ctx.save();
			renderCallback(this);
			ctx.restore();
		});
		await this.#eventHandler.render();
		this.#afterRenderCallbacks.forEach(async (afterRenderCallback) => {
			ctx.save();
			console.log(afterRenderCallback);
			afterRenderCallback(this);
			ctx.restore();
		});
	};

	run() {
		this.setup();
		const loop: FrameRequestCallback = async (t) => {
			this.#eventHandler.poll();
			await this.render(t);

			// this.testCanvas
			// 	?.getContext('bitmaprenderer')
			// 	?.transferFromImageBitmap(this.#eventHandler.context2d.canvas!.transferToImageBitmap());

			this.#frameId = requestAnimationFrame(loop);
		};
		this.#frameId = requestAnimationFrame(loop);
	}

	quit() {
		window.cancelAnimationFrame(this.#frameId);
		this.#renderCallbacks.clear();
		this.#afterRenderCallbacks.clear();
		this.#eventHandler.clear();
	}
}
