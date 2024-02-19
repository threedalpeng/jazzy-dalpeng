type PickByValue<T, Value> = { [P in keyof T as T[P] extends Value | undefined ? P : never]: T[P] };
export interface PointerEventMap extends PickByValue<HTMLElementEventMap, PointerEvent> {}
export const pointerEventTypes: (keyof PointerEventMap)[] = [
	'gotpointercapture',
	'lostpointercapture',
	'pointercancel',
	'pointerdown',
	'pointerenter',
	'pointerleave',
	'pointermove',
	'pointerout',
	'pointerover',
	'pointerup'
];

export type CanvasPointerEventType = 'up' | 'down' | 'over' | 'out' | 'move' | 'click';

// type PickProperties<T> = Pick<T, { [K in keyof T]: T[K] extends Function ? never : K }[keyof T]>;
export interface CanvasPointerEvent {
	type: CanvasPointerEventType;
	detail: any;
}

export type OnHitCallback = (ev: CanvasPointerEvent) => any;
type PointerState = 'down' | 'up' | 'pressed';

export class CanvasEventHandler {
	static #nextHitCode = 0;
	static get nextHitCode() {
		return `#${(++this.#nextHitCode).toString(16).padStart(6, '0')}`;
	}

	#canvas: OffscreenCanvas | null = null;
	#context2d: OffscreenCanvasRenderingContext2D | null = null;
	get context2d() {
		return this.#context2d!!;
	}

	setup(width: number, height: number) {
		this.#canvas = new OffscreenCanvas(width, height);
		this.#context2d = this.#canvas.getContext('2d', {
			alpha: false,
			willReadFrequently: true
		})!!;
		this.#context2d.imageSmoothingEnabled = false;
	}

	#hitRenderMap: Map<string, (ctx: OffscreenCanvasRenderingContext2D) => any> = new Map();
	#onHitMap: Map<string, OnHitCallback> = new Map();
	onHitboxRender(
		code: string,
		renderFn: (ctx: OffscreenCanvasRenderingContext2D) => any,
		onHit: OnHitCallback
	) {
		this.#hitRenderMap.set(code, renderFn);
		this.#onHitMap.set(code, onHit);
	}
	removeHitboxRender(code: string) {
		this.#hitRenderMap.delete(code);
		this.#onHitMap.delete(code);
	}
	registerOnHitMap(eventHandler: CanvasEventHandler) {
		this.#onHitMap = eventHandler.#onHitMap;
	}

	#pointerInfoMap = new Map<
		number,
		{
			id: number;
			type: string;
			state: Map<number, PointerState>;
			delta: { x: number; y: number };
			position: { x: number; y: number };
			moved: boolean;
			hitCode: string;
			lastDownHitCode: string;
		}
	>();
	#unpolledPointerInfoMap = new Map<
		number,
		{
			buttons: Set<number>;
			delta: { x: number; y: number };
			position: { x: number; y: number };
			moved: boolean;
			hitCode: string;
		}
	>();
	static getPointerPosition(ev: PointerEvent) {
		const canvas = ev.currentTarget as HTMLCanvasElement;
		const bounding = canvas.getBoundingClientRect();
		return [
			((ev.clientX - bounding.left) * canvas.width) / bounding.width,
			((ev.clientY - bounding.top) * canvas.height) / bounding.height
		];
	}
	handleEvent(ev: PointerEvent) {
		ev.preventDefault();

		const [x, y] = CanvasEventHandler.getPointerPosition(ev);
		const [r, g, b] = this.context2d.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;

		const hitCode = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;

		let currentPointerInfo = this.#pointerInfoMap.get(ev.pointerId);
		if (currentPointerInfo === undefined) {
			currentPointerInfo = {
				id: ev.pointerId,
				type: ev.pointerType,
				state: new Map<number, 'down' | 'up' | 'pressed'>(),
				delta: { x: 0, y: 0 },
				position: { x: 0, y: 0 },
				moved: false,
				hitCode,
				lastDownHitCode: ''
			};
			this.#pointerInfoMap.set(ev.pointerId, currentPointerInfo);
		}
		let unpolledPointerInfo = this.#unpolledPointerInfoMap.get(ev.pointerId);
		if (unpolledPointerInfo === undefined) {
			unpolledPointerInfo = {
				buttons: new Set<number>(),
				delta: { x: 0, y: 0 },
				position: { x: 0, y: 0 },
				moved: false,
				hitCode
			};
			this.#unpolledPointerInfoMap.set(ev.pointerId, unpolledPointerInfo);
		}

		unpolledPointerInfo.hitCode = hitCode;
		switch (ev.type as keyof PointerEventMap) {
			case 'pointerdown':
				unpolledPointerInfo.buttons.add(ev.button);
				break;
			case 'pointerup':
				unpolledPointerInfo.buttons.delete(ev.button);
				break;
			case 'pointermove':
				unpolledPointerInfo.position = { x, y };
				unpolledPointerInfo.moved = true;
				unpolledPointerInfo.delta = {
					x: x - currentPointerInfo.position.x,
					y: y - currentPointerInfo.position.y
				};
				break;
			case 'pointerout':
			case 'pointerleave':
				unpolledPointerInfo.moved = true;
				unpolledPointerInfo.delta = {
					x: 0,
					y: 0
				};
				break;
		}
	}

	/**
	 * For each pointerId, checking these events:
	 * - "up" and "down"
	 * - "click"
	 * - "over" and "out"
	 * - "move"
	 */
	poll() {
		for (const [pointerId, unpolledInfo] of this.#unpolledPointerInfoMap) {
			const pointerInfo = this.#pointerInfoMap.get(pointerId)!!;
			const onHit = this.#onHitMap.get(unpolledInfo.hitCode);
			const prevTargetOnHit = this.#onHitMap.get(pointerInfo.hitCode);
			const hitEventTypes: [CanvasPointerEventType, number | null][] = [];
			const prevTargetHitEventTypes: [CanvasPointerEventType, number | null][] = [];

			const hitRegionChanged = unpolledInfo.hitCode != pointerInfo.hitCode;

			for (const [button, state] of [...pointerInfo.state] /** Copy state map */) {
				if (state === 'up') {
					if (unpolledInfo.buttons.has(button)) {
						pointerInfo.state.set(button, 'down');
						pointerInfo.lastDownHitCode = unpolledInfo.hitCode;
						hitEventTypes.push(['down', button]);
					} else {
						pointerInfo.state.delete(button);
					}
				} else {
					if (unpolledInfo.buttons.has(button)) {
						pointerInfo.state.set(button, 'pressed');
					} else {
						pointerInfo.state.set(button, 'up');
						hitEventTypes.push(['up', button]);
						if (unpolledInfo.hitCode === pointerInfo.lastDownHitCode) {
							hitEventTypes.push(['click', button]);
						}
					}
				}
			}
			for (const button of unpolledInfo.buttons) {
				if (!pointerInfo.state.has(button)) {
					pointerInfo.state.set(button, 'down');
					pointerInfo.lastDownHitCode = unpolledInfo.hitCode;
					hitEventTypes.push(['down', button]);
				}
			}

			if (unpolledInfo.moved) {
				pointerInfo.delta = structuredClone(unpolledInfo.delta);
				unpolledInfo.delta.x = 0;
				unpolledInfo.delta.y = 0;
				unpolledInfo.moved = false;

				hitEventTypes.push(['move', null]);
			}

			if (hitRegionChanged) {
				hitEventTypes.push(['over', null]);
				prevTargetHitEventTypes.push(['out', null]);
			}

			pointerInfo.hitCode = unpolledInfo.hitCode;
			pointerInfo.position = unpolledInfo.position;

			hitEventTypes.forEach(([type, button]) => {
				if (onHit)
					onHit({
						type,
						detail: { ...pointerInfo, button, state: Object.entries(pointerInfo.state) }
					});
			});
			prevTargetHitEventTypes.forEach(([type, button]) => {
				if (prevTargetOnHit)
					prevTargetOnHit({
						type,
						detail: { ...pointerInfo, button, state: Object.entries(pointerInfo.state) }
					});
			});
		}
	}

	async beforeRender() {
		let hitCtx = this.context2d;
		hitCtx.clearRect(0, 0, this.#canvas!!.width, this.#canvas!!.height);
	}
	async render() {
		let hitCtx = this.context2d;
		this.#hitRenderMap.forEach(async (renderCallback, hitCode) => {
			hitCtx.save();
			renderCallback(hitCtx);
			hitCtx.restore();
		});
	}
	clear() {
		this.#hitRenderMap.clear();
		this.#onHitMap.clear();
	}
}
