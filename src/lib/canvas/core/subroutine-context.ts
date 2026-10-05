import { onDestroy, onMount, setContext } from 'svelte';
import { CanvasContext, type CanvasGetter, type CanvasRenderCallback } from './context';

export const setSubroutineCanvasContext = (
	upperContext: CanvasContext,
	canvasGetter: CanvasGetter,
	options?: {
		beforeRender?: CanvasRenderCallback;
		afterRender?: CanvasRenderCallback;
		dimensions?: () => { width: number; height: number; scale: number };
		cache?: () => { key: unknown } | undefined;
		orderNode?: () => Node | undefined;
	}
) => {
	const subCanvasContext = new CanvasContext(
		canvasGetter,
		options?.dimensions ??
			(() => ({
				width: Number(canvasGetter().dataset.logicalWidth ?? canvasGetter().width),
				height: Number(canvasGetter().dataset.logicalHeight ?? canvasGetter().height),
				scale: upperContext.pixelScale
			}))
	);
	setContext('canvas', subCanvasContext);
	upperContext.registerSubroutineContext(subCanvasContext);
	const order = upperContext.reserveOrder();
	const render: CanvasRenderCallback = () => {
		if (options?.beforeRender) {
			options.beforeRender(subCanvasContext);
		}
		subCanvasContext.render(upperContext.frameTime, options?.cache?.());
		if (options?.afterRender) {
			options.afterRender(subCanvasContext);
		}
	};
	onMount(() => upperContext.onRender(render, options?.orderNode ?? order));
	onDestroy(() => {
		upperContext.removeRender(render);
		subCanvasContext.quit();
	});
	return subCanvasContext;
};
