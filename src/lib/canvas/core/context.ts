import { CanvasEventHandler, pointerEventTypes, type OnHitCallback } from './events';

export type CanvasGetter = () => HTMLCanvasElement;
export type CanvasRenderCallback = (canvasContext: CanvasContext) => void;
export type OffscreenCanvasRenderCallback = (
	ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D
) => void;
export type CanvasOrder = number | (() => Node | undefined);

export interface CanvasDimensions {
	width: number;
	height: number;
	scale: number;
}

export class CanvasContext {
	#canvasGetter: CanvasGetter;
	#timePassed = 0;
	#frameTime = 0;
	#frameDimensions: CanvasDimensions | null = null;
	#nextOrder = 0;
	#dirty = true;
	#parent: CanvasContext | null = null;
	#children = new Set<CanvasContext>();
	#orderObserver: MutationObserver | null = null;
	#cacheKey: unknown;
	#renderedDimensions: CanvasDimensions | null = null;
	#hitCallbacks = new Map<string, CanvasRenderCallback>();
	#lastTime: number | null = null;
	#running = false;
	#setup = false;
	#preventContextMenu = (ev: Event) => ev.preventDefault();
	#frameId = 0;
	#eventHandler = new CanvasEventHandler();
	constructor(
		canvasGetter: CanvasGetter,
		private dimensions?: () => CanvasDimensions
	) {
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
	get pixelScale() {
		return this.#readDimensions().scale;
	}
	get frameTime() {
		return this.#frameTime;
	}
	get delta() {
		return this.#timePassed;
	}

	get width() {
		return this.#readDimensions().width;
	}
	set width(w) {
		if (this.dimensions) throw new Error('Set logical width through the dimensions provider');
		this.canvas.width = w;
		this.invalidate();
	}
	get height() {
		return this.#readDimensions().height;
	}
	set height(h) {
		if (this.dimensions) throw new Error('Set logical height through the dimensions provider');
		this.canvas.height = h;
		this.invalidate();
	}

	#setupCallbacks: Set<CanvasRenderCallback> = new Set();
	onSetup(callback: CanvasRenderCallback) {
		this.#setupCallbacks.add(callback);
	}
	removeSetup(callback: CanvasRenderCallback) {
		this.#setupCallbacks.delete(callback);
	}

	#renderCallbacks = new Map<
		CanvasRenderCallback,
		{ sequence: number; node?: () => Node | undefined }
	>();
	#orderedCallbacks: CanvasRenderCallback[] | null = null;
	reserveOrder() {
		return this.#nextOrder++;
	}
	invalidate() {
		this.#dirty = true;
		this.#parent?.invalidate();
	}
	#readDimensions(): CanvasDimensions {
		return (
			this.#frameDimensions ??
			this.dimensions?.() ?? {
				width: this.canvas.width,
				height: this.canvas.height,
				scale: 1
			}
		);
	}
	observeOrder(root: Node) {
		this.#orderObserver?.disconnect();
		this.#orderObserver = new MutationObserver(() => this.#invalidateOrder());
		this.#orderObserver.observe(root, { childList: true, subtree: true });
	}
	#invalidateOrder() {
		this.#orderedCallbacks = null;
		this.invalidate();
		for (const child of this.#children) child.#invalidateOrder();
	}
	onRender(callback: CanvasRenderCallback, order: CanvasOrder = this.reserveOrder()) {
		this.#renderCallbacks.set(
			callback,
			typeof order === 'number'
				? { sequence: order }
				: { sequence: this.reserveOrder(), node: order }
		);
		this.#orderedCallbacks = null;
		this.invalidate();
	}
	removeRender(callback: CanvasRenderCallback) {
		this.#renderCallbacks.delete(callback);
		this.#orderedCallbacks = null;
		this.invalidate();
	}

	#afterRenderCallbacks: Set<CanvasRenderCallback> = new Set();
	onAfterRender(callback: CanvasRenderCallback) {
		this.#afterRenderCallbacks.add(callback);
		this.invalidate();
	}
	removeAfterRender(callback: CanvasRenderCallback) {
		this.#afterRenderCallbacks.delete(callback);
		this.invalidate();
	}

	onHitboxRender(
		code: string,
		renderFn: (ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D) => void,
		onHit: OnHitCallback,
		order: CanvasOrder = this.reserveOrder()
	) {
		this.removeHitboxRender(code);
		this.#eventHandler.onHitboxRender(code, renderFn, onHit);
		const callback = () => this.#eventHandler.renderRegion(code);
		this.#hitCallbacks.set(code, callback);
		this.onRender(callback, order);
	}
	removeHitboxRender(code: string) {
		this.#eventHandler.removeHitboxRender(code);
		const callback = this.#hitCallbacks.get(code);
		if (callback) this.removeRender(callback);
		this.#hitCallbacks.delete(code);
	}

	registerSubroutineContext(subContext: CanvasContext) {
		subContext.#eventHandler.registerOnHitMap(this.#eventHandler);
		subContext.#parent = this;
		this.#children.add(subContext);
	}

	setup() {
		if (this.#setup) return;
		this.#setup = true;
		const canvas = this.canvas;
		const dimensions = this.#readDimensions();
		this.#eventHandler.setup(dimensions.width, dimensions.height);

		canvas.addEventListener('contextmenu', this.#preventContextMenu);
		pointerEventTypes.forEach((evtype) => canvas.addEventListener(evtype, this.#eventHandler));
		this.#setupCallbacks.forEach((setupCallback) => {
			setupCallback(this);
		});
	}

	render = (t: number, cache?: { key: unknown }) => {
		this.#frameTime = t;
		this.#timePassed = this.#lastTime === null ? 0 : Math.max(0, t - this.#lastTime);
		this.#lastTime = t;
		const dimensions = this.dimensions?.() ?? {
			width: this.canvas.width,
			height: this.canvas.height,
			scale: 1
		};
		const { width, height, scale } = dimensions;
		if (![width, height, scale].every((v) => Number.isFinite(v) && v > 0)) {
			throw new RangeError('Canvas dimensions and scale must be finite and positive');
		}
		const previous = this.#renderedDimensions;
		if (
			cache &&
			!this.#dirty &&
			Object.is(cache.key, this.#cacheKey) &&
			previous?.width === width &&
			previous.height === height &&
			previous.scale === scale
		)
			return;
		this.#frameDimensions = dimensions;
		try {
			this.setup();
			const canvas = this.canvas;
			if (this.dimensions) {
				const pixelWidth = Math.max(1, Math.round(width * scale));
				const pixelHeight = Math.max(1, Math.round(height * scale));
				if (canvas.width !== pixelWidth) canvas.width = pixelWidth;
				if (canvas.height !== pixelHeight) canvas.height = pixelHeight;
				canvas.dataset.logicalWidth = String(width);
				canvas.dataset.logicalHeight = String(height);
			}
			this.#eventHandler.resize(width, height);
			const ctx = this.context2d;
			// Rounded backing dimensions must still cover the complete logical rectangle.
			if (this.dimensions)
				ctx.setTransform(canvas.width / width, 0, 0, canvas.height / height, 0, 0);
			ctx.clearRect(0, 0, width, height);
			this.#eventHandler.beforeRender();
			this.#orderedCallbacks ??= [...this.#renderCallbacks]
				.sort((a, b) => {
					const first = a[1].node?.();
					const second = b[1].node?.();
					if (first && second && first !== second) {
						const relation = first.compareDocumentPosition(second);
						if (!(relation & 1)) {
							if (relation & 4) return -1;
							if (relation & 2) return 1;
						}
					}
					return a[1].sequence - b[1].sequence;
				})
				.map(([callback]) => callback);
			const invoke = (callback: CanvasRenderCallback) => {
				ctx.save();
				try {
					callback(this);
				} finally {
					ctx.restore();
				}
			};
			this.#dirty = false;
			for (const callback of this.#orderedCallbacks) invoke(callback);
			for (const callback of this.#afterRenderCallbacks) invoke(callback);
			this.#renderedDimensions = { ...dimensions };
			this.#cacheKey = cache?.key;
		} catch (error) {
			this.invalidate();
			throw error;
		} finally {
			this.#frameDimensions = null;
		}
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
		this.#orderedCallbacks = null;
		this.#hitCallbacks.clear();
		this.#renderedDimensions = null;
		this.invalidate();
		this.#afterRenderCallbacks.clear();
		this.#eventHandler.clear();
		this.#orderObserver?.disconnect();
		this.#orderObserver = null;
		if (this.#parent) this.#parent.#children.delete(this);
		this.#parent = null;
		this.#children.clear();
	}
}
