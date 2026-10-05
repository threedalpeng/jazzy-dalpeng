import { flushSync } from 'svelte';

type FrameCallback = (time: number) => void;
const updates = new Set<FrameCallback>();
const drawings = new Set<FrameCallback>();
let frameId: number | null = null;

function frame(time: number) {
	frameId = null;
	try {
		for (const update of [...updates]) if (updates.has(update)) update(time);
		// Commit reactive note/beat state before any canvas samples its props.
		flushSync();
		for (const draw of [...drawings]) if (drawings.has(draw)) draw(time);
	} finally {
		requestFrame();
	}
}
function requestFrame() {
	if (frameId === null && (updates.size || drawings.size)) frameId = requestAnimationFrame(frame);
}
export function onFrame(callback: FrameCallback, phase: 'update' | 'draw' = 'update') {
	const callbacks = phase === 'update' ? updates : drawings;
	callbacks.add(callback);
	requestFrame();
	return () => {
		callbacks.delete(callback);
		if (!updates.size && !drawings.size && frameId !== null) {
			cancelAnimationFrame(frameId);
			frameId = null;
		}
	};
}
