import { setContext } from 'svelte';
import { CanvasContext, type CanvasGetter, type CanvasRenderCallback } from './context';

export const setSubroutineCanvasContext = (
	upperContext: CanvasContext,
	canvasGetter: CanvasGetter,
	options?: {
		beforeRender?: CanvasRenderCallback;
		afterRender?: CanvasRenderCallback;
	}
) => {
	let subCanvasContext = new CanvasContext(canvasGetter);
	setContext('canvas', subCanvasContext);
	upperContext.registerSubroutineContext(subCanvasContext);
	upperContext.onRender(({ delta }) => {
		if (options?.beforeRender) {
			options.beforeRender(subCanvasContext);
		}
		subCanvasContext.render(delta);
		if (options?.afterRender) {
			options.afterRender(subCanvasContext);
		}
	});
	return subCanvasContext;
};
