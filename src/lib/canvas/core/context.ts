import { CanvasEventHandler, pointerEventTypes, type OnHitCallback } from './events';

export type CanvasGetter = () => HTMLCanvasElement;
export type CanvasRenderCallback = (canvasContext: CanvasContext) => void;
export type OffscreenCanvasRenderCallback = (
	ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D
) => void;
export class CanvasContext {
	#canvasGetter: CanvasGetter;
	#timePassed = 0;
	#lastTime: number | null = null;
	#running = false;
	#setup = false;
	#preventContextMenu = (ev: Event) => ev.preventDefault();
	#frameId = 0;
	#eventHandler = new CanvasEventHandler();
	constructor(canvasGetter: CanvasGetter) {
		this.#canvasGetter = canvasGetter;
	}

	get canvas() {
		return this.#canvasGetter();
	}
	get context2d() {
		return this.canvas.getContext('2d')!;
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
		this.#afterRenderCallbacks.add(callback);
	}
	removeAfterRender(callback: CanvasRenderCallback) {
		this.#afterRenderCallbacks.delete(callback);
	}

	onHitboxRender(
		code: string,
		renderFn: (ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D) => void,
		onHit: OnHitCallback
	) {
		this.#eventHandler.onHitboxRender(code, renderFn, onHit);
	}
	removeHitboxRender(code: string) {
		this.#eventHandler.removeHitboxRender(code);
	}

	registerSubroutineContext(subContext: CanvasContext) {
		subContext.#eventHandler.registerOnHitMap(this.#eventHandler);
	}

	setup() {
		if (this.#setup) return;
		this.#setup = true;
		const canvas = this.canvas;
		this.#eventHandler.setup(this.canvas.width, this.canvas.height);

		canvas.addEventListener('contextmenu', this.#preventContextMenu);
		pointerEventTypes.forEach((evtype) => canvas.addEventListener(evtype, this.#eventHandler));
		this.#setupCallbacks.forEach((setupCallback) => {
			setupCallback(this);
		});
	}

	render: FrameRequestCallback = (t) => {
		this.setup();
		this.#timePassed = this.#lastTime === null ? 0 : Math.max(0, t - this.#lastTime);
		this.#lastTime = t;
		this.#eventHandler.resize(this.width, this.height);
		const ctx = this.context2d;

		ctx.clearRect(0, 0, this.width, this.height);
		this.#eventHandler.beforeRender();

		this.#renderCallbacks.forEach((renderCallback) => {
			ctx.save();
			try {
				renderCallback(this);
			} finally {
				ctx.restore();
			}
		});
		this.#eventHandler.render();
		this.#afterRenderCallbacks.forEach((afterRenderCallback) => {
			ctx.save();
			try {
				afterRenderCallback(this);
			} finally {
				ctx.restore();
			}
		});
	};

	run() {
		if (this.#running) return;
		this.setup();
		this.#running = true;
		const loop: FrameRequestCallback = (t) => {
			if (!this.#running) return;
			this.#eventHandler.poll();
			this.render(t);
			if (this.#running) this.#frameId = requestAnimationFrame(loop);
		};
		this.#frameId = requestAnimationFrame(loop);
	}

	quit() {
		this.#running = false;
		cancelAnimationFrame(this.#frameId);
		if (this.#setup) {
			const canvas = this.canvas;
			canvas.removeEventListener('contextmenu', this.#preventContextMenu);
			for (const type of pointerEventTypes) canvas.removeEventListener(type, this.#eventHandler);
		}
		this.#setup = false;
		this.#lastTime = null;
		this.#setupCallbacks.clear();
		this.#renderCallbacks.clear();
		this.#afterRenderCallbacks.clear();
		this.#eventHandler.clear();
	}
}
