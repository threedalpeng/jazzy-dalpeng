import { getContext, onDestroy, onMount, setContext } from 'svelte';
import {
	CanvasContext,
	type CanvasGetter,
	type CanvasRenderCallback,
	type OffscreenCanvasRenderCallback
} from './context';
import { CanvasEventHandler, type OnHitCallback } from './events';

export const setCanvasContext = (canvasGetter: CanvasGetter) => {
	let context = setContext('canvas', new CanvasContext(canvasGetter));
	onMount(() => {
		context.run();
	});
	onDestroy(() => {
		context.quit();
	});
	return context;
};

export const getCanvasContext: () => CanvasContext = () => {
	return getContext('canvas');
};

export const onCanvasSetup = (setupFn: CanvasRenderCallback) => {
	const canvasContext = getCanvasContext();
	onMount(() => {
		canvasContext.onSetup(setupFn);
	});

	onDestroy(() => {
		canvasContext.removeSetup(setupFn);
	});
};

export const onCanvasRender = (renderFn: CanvasRenderCallback) => {
	const canvasContext = getCanvasContext();
	onMount(() => {
		canvasContext.onRender(renderFn);
	});

	onDestroy(() => {
		canvasContext.removeRender(renderFn);
	});
};

export const onCanvasHit = (
	active: boolean,
	hitboxRenderFn: OffscreenCanvasRenderCallback,
	onHit: OnHitCallback
) => {
	const canvasContext = getCanvasContext();
	const nextHitCode = CanvasEventHandler.nextHitCode;
	function render(ctx: OffscreenCanvasRenderingContext2D) {
		ctx.fillStyle = nextHitCode;
		ctx.strokeStyle = nextHitCode;
		hitboxRenderFn(ctx);
	}
	onMount(() => {
		if (active) {
			canvasContext.onHitboxRender(nextHitCode, render, onHit);
		}
	});
	onDestroy(() => {
		if (active) {
			canvasContext.removeHitboxRender(nextHitCode);
		}
	});
};

export const onAfterCanvasRender = (renderFn: CanvasRenderCallback) => {
	const canvasContext = getCanvasContext();
	onMount(() => {
		canvasContext.onAfterRender(renderFn);
	});

	onDestroy(() => {
		canvasContext.removeAfterRender(renderFn);
	});
};
