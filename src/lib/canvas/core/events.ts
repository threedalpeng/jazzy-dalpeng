export const pointerEventTypes = [
	'pointerdown',
	'pointerup',
	'pointermove',
	'pointerleave',
	'pointercancel',
	'lostpointercapture'
] as const;
export type CanvasPointerEventType = 'up' | 'down' | 'over' | 'out' | 'move' | 'click' | 'cancel';
export interface CanvasPointerDetail {
	id: number;
	type: string;
	button: number | null;
	position: { x: number; y: number };
	delta: { x: number; y: number };
	state: Record<number, 'pressed'>;
}
export interface CanvasPointerEvent {
	type: CanvasPointerEventType;
	detail: CanvasPointerDetail;
}
export type OnHitCallback = (ev: CanvasPointerEvent) => void;
type PendingPointer = CanvasPointerDetail & { eventType: string; hitCode: string };

export class CanvasEventHandler {
	static #nextHitCode = 0;
	static get nextHitCode() {
		if (this.#nextHitCode >= 0xffffff) throw new RangeError('Canvas hit codes exhausted');
		return `#${(++this.#nextHitCode).toString(16).padStart(6, '0')}`;
	}
	#canvas: OffscreenCanvas | HTMLCanvasElement | null = null;
	#context2d: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D | null = null;
	get context2d() {
		if (!this.#context2d) throw new Error('Canvas event handler is not initialized');
		return this.#context2d;
	}
	setup(width: number, height: number) {
		this.#canvas =
			typeof OffscreenCanvas === 'undefined'
				? document.createElement('canvas')
				: new OffscreenCanvas(width, height);
		this.#context2d = this.#canvas.getContext('2d', { willReadFrequently: true }) as
			OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D | null;
		this.resize(width, height);
	}
	resize(width: number, height: number) {
		if (!this.#canvas) return;
		if (this.#canvas.width !== width) this.#canvas.width = width;
		if (this.#canvas.height !== height) this.#canvas.height = height;
		this.context2d.imageSmoothingEnabled = false;
	}
	#hitRenderMap = new Map<
		string,
		(ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D) => void
	>();
	#onHitMap = new Map<string, OnHitCallback>();
	onHitboxRender(
		code: string,
		render: (ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D) => void,
		onHit: OnHitCallback
	) {
		this.#hitRenderMap.set(code, render);
		this.#onHitMap.set(code, onHit);
	}
	removeHitboxRender(code: string) {
		this.#hitRenderMap.delete(code);
		this.#onHitMap.delete(code);
	}
	registerOnHitMap(handler: CanvasEventHandler) {
		this.#onHitMap = handler.#onHitMap;
	}
	#pending: PendingPointer[] = [];
	#pointers = new Map<
		number,
		{
			position: { x: number; y: number };
			hitCode: string;
			buttons: Map<
				number,
				{ hitCode: string; position: { x: number; y: number }; dragged: boolean }
			>;
		}
	>();
	static getPointerPosition(ev: PointerEvent) {
		const canvas = ev.currentTarget as HTMLCanvasElement;
		const bounds = canvas.getBoundingClientRect();
		return [
			bounds.width
				? ((ev.clientX - bounds.left) * Number(canvas.dataset?.logicalWidth ?? canvas.width)) /
					bounds.width
				: -1,
			bounds.height
				? ((ev.clientY - bounds.top) * Number(canvas.dataset?.logicalHeight ?? canvas.height)) /
					bounds.height
				: -1
		];
	}
	handleEvent(ev: PointerEvent) {
		if (ev.type === 'pointerdown' && ev.cancelable) ev.preventDefault();
		const canvas = ev.currentTarget as HTMLCanvasElement;
		const [x, y] = CanvasEventHandler.getPointerPosition(ev);
		let hitCode = '';
		if (
			this.#context2d &&
			x >= 0 &&
			y >= 0 &&
			x < this.context2d.canvas.width &&
			y < this.context2d.canvas.height &&
			ev.type !== 'pointerleave'
		) {
			const [r, g, b, alpha] = this.context2d.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
			if (alpha === 255)
				hitCode = `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
		}
		this.#pending.push({
			eventType: ev.type,
			hitCode,
			id: ev.pointerId,
			type: ev.pointerType,
			button: ev.button,
			position: { x, y },
			delta: { x: 0, y: 0 },
			state: {}
		});
		if (ev.type === 'pointerdown') canvas.setPointerCapture?.(ev.pointerId);
	}
	poll() {
		const pending = this.#pending;
		this.#pending = [];
		for (const ev of pending) {
			const pointer = this.#pointers.get(ev.id) ?? {
				position: ev.position,
				hitCode: '',
				buttons: new Map()
			};
			this.#pointers.set(ev.id, pointer);
			const detail: CanvasPointerDetail = {
				id: ev.id,
				type: ev.type,
				button: ev.button,
				position: ev.position,
				delta: { x: ev.position.x - pointer.position.x, y: ev.position.y - pointer.position.y },
				state: {}
			};
			const emit = (code: string, type: CanvasPointerEventType) => {
				this.#onHitMap.get(code)?.({
					type,
					detail: {
						...detail,
						state: Object.fromEntries([...pointer.buttons.keys()].map((b) => [b, 'pressed']))
					}
				});
			};
			if (ev.eventType === 'pointercancel' || ev.eventType === 'lostpointercapture') {
				for (const [button, down] of pointer.buttons) {
					detail.button = button;
					emit(down.hitCode, 'cancel');
				}
				emit(pointer.hitCode, 'out');
				this.#pointers.delete(ev.id);
				continue;
			}
			if (ev.hitCode !== pointer.hitCode) {
				emit(pointer.hitCode, 'out');
				emit(ev.hitCode, 'over');
			}
			if (ev.eventType === 'pointerdown') {
				pointer.buttons.set(ev.button!, {
					hitCode: ev.hitCode,
					position: ev.position,
					dragged: false
				});
				emit(ev.hitCode, 'down');
			} else if (ev.eventType === 'pointerup') {
				const down = pointer.buttons.get(ev.button!);
				pointer.buttons.delete(ev.button!);
				emit(down?.hitCode ?? ev.hitCode, 'up');
				if (down && down.hitCode === ev.hitCode && !down.dragged) emit(ev.hitCode, 'click');
			} else if (ev.eventType === 'pointermove') {
				for (const down of pointer.buttons.values()) {
					if (Math.hypot(ev.position.x - down.position.x, ev.position.y - down.position.y) > 5)
						down.dragged = true;
				}
				emit(ev.hitCode, 'move');
			}
			pointer.hitCode = ev.hitCode;
			pointer.position = ev.position;
			if (
				!pointer.buttons.size &&
				(ev.eventType === 'pointerleave' || (ev.eventType === 'pointerup' && ev.type !== 'mouse'))
			) {
				emit(pointer.hitCode, 'out');
				this.#pointers.delete(ev.id);
			}
		}
	}
	beforeRender() {
		this.context2d.clearRect(0, 0, this.context2d.canvas.width, this.context2d.canvas.height);
	}
	render() {
		for (const render of this.#hitRenderMap.values()) {
			const ctx = this.context2d;
			ctx.save();
			try {
				render(ctx);
			} finally {
				ctx.restore();
			}
		}
	}
	clear() {
		for (const code of this.#hitRenderMap.keys()) this.#onHitMap.delete(code);
		this.#hitRenderMap.clear();
		this.#pending = [];
		this.#pointers.clear();
	}
}
