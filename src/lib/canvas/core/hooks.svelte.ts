import { getContext, onDestroy, onMount, setContext } from 'svelte';
import {
	CanvasContext,
	type CanvasGetter,
	type CanvasRenderCallback,
	type OffscreenCanvasRenderCallback
} from './context';
import { CanvasEventHandler, type OnHitCallback } from './events';

export const setCanvasContext = (
	canvasGetter: CanvasGetter,
	dimensions?: () => { width: number; height: number; scale: number }
) => {
	const context = setContext('canvas', new CanvasContext(canvasGetter, dimensions));
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

export const onCanvasRender = (
	renderFn: CanvasRenderCallback,
	orderNode?: () => Node | undefined
) => {
	const canvasContext = getCanvasContext();
	const order = canvasContext.reserveOrder();
	onMount(() => {
		canvasContext.onRender(renderFn, orderNode ?? order);
	});

	onDestroy(() => {
		canvasContext.removeRender(renderFn);
	});
};

export const onCanvasHit = (
	active: boolean | (() => boolean),
	hitboxRenderFn: OffscreenCanvasRenderCallback,
	onHit: OnHitCallback,
	orderNode?: () => Node | undefined
) => {
	const canvasContext = getCanvasContext();
	const nextHitCode = CanvasEventHandler.nextHitCode;
	const order = canvasContext.reserveOrder();
	const isActive = () => (typeof active === 'function' ? active() : active);
	function render(ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D) {
		if (!isActive()) return;
		ctx.fillStyle = nextHitCode;
		ctx.strokeStyle = nextHitCode;
		hitboxRenderFn(ctx);
	}

	onMount(() => {
		canvasContext.onHitboxRender(
			nextHitCode,
			render,
			(ev) => {
				if (isActive()) onHit(ev);
			},
			orderNode ?? order
		);
		return () => canvasContext.removeHitboxRender(nextHitCode);
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
