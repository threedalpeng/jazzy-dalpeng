import { createEventDispatcher } from "svelte";

type PickByValue<T, Value> = { [P in keyof T as T[P] extends Value | undefined ? P : never]: T[P] };
interface MouseEventMap extends PickByValue<HTMLElementEventMap, MouseEvent> {}
export const mouseBasedEventTypes: (keyof MouseEventMap)[] = [
	'auxclick',
	'click',
	'contextmenu',
	'dblclick',
	'drag',
	'dragend',
	'dragenter',
	'dragleave',
	'dragover',
	'dragstart',
	'drop',
	'gotpointercapture',
	'lostpointercapture',
	'mousedown',
	'mouseenter',
	'mouseleave',
	'mousemove',
	'mouseout',
	'mouseover',
	'mouseup',
	'pointercancel',
	'pointerdown',
	'pointerenter',
	'pointerleave',
	'pointermove',
	'pointerout',
	'pointerover',
	'pointerup',
	'wheel'
];

let nextHitCode = 0;

export function getNextHitCode() {
	return `#${(++nextHitCode).toString(16).padStart(6, '0')}`;
}

export function dispatchMouseEvent() {
    const dispatch = createEventDispatcher();

}