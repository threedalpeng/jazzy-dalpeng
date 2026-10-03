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
	const subCanvasContext = new CanvasContext(canvasGetter);
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
