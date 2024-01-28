import { setContext } from 'svelte';
import { CanvasContext, type CanvasGetter, type CanvasRenderCallback } from './context';
import { beforeNavigate } from '$app/navigation';

export const setSubroutineCanvasContext = (
	upperContext: CanvasContext,
	canvasGetter: CanvasGetter,
	options?: {
		beforeRender?: CanvasRenderCallback;
		afterRender?: CanvasRenderCallback;
	}
) => {
	let subCanvasContext = new CanvasContext(canvasGetter);
	console.log('subroutine registering');
	setContext('canvas', subCanvasContext);
	upperContext.registerSubroutineContext(subCanvasContext);
	// upperContext.onSetup((context) => {
	// 	console.log(context);
	// });
	upperContext.onRender(({ delta }) => {
		if (options?.beforeRender) {
			options.beforeRender(subCanvasContext);
		}
		subCanvasContext.render(delta);
		if (options?.afterRender) {
			options.afterRender(subCanvasContext);
		}
	});
	beforeNavigate(() => {});
	return subCanvasContext;
};
