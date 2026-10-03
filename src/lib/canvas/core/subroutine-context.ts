import { onDestroy, setContext } from 'svelte';
import { CanvasContext, type CanvasGetter, type CanvasRenderCallback } from './context';

export const setSubroutineCanvasContext = (
	upperContext: CanvasContext,
	canvasGetter: CanvasGetter,
	options?: {
		beforeRender?: CanvasRenderCallback;
		afterRender?: CanvasRenderCallback;
	}
) => {
	const subCanvasContext = new CanvasContext(canvasGetter, () => ({
		width: Number(canvasGetter().dataset.logicalWidth ?? canvasGetter().width),
		height: Number(canvasGetter().dataset.logicalHeight ?? canvasGetter().height),
		scale: upperContext.pixelScale
	}));
	setContext('canvas', subCanvasContext);
	upperContext.registerSubroutineContext(subCanvasContext);
	const render: CanvasRenderCallback = () => {
		if (options?.beforeRender) {
			options.beforeRender(subCanvasContext);
		}
		subCanvasContext.render(performance.now());
		if (options?.afterRender) {
			options.afterRender(subCanvasContext);
		}
	};
	upperContext.onRender(render);
	onDestroy(() => {
		upperContext.removeRender(render);
		subCanvasContext.quit();
	});
	return subCanvasContext;
};
