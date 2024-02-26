<script lang="ts">
	import { getCanvasContext } from '../core/hooks';
	import { setSubroutineCanvasContext } from '../core/subroutine-context';

	/* Outer Context */
	const upperCanvasContext = getCanvasContext();

	/* Inner Context */
	const offscreenCanvas = document.createElement('canvas');

	offscreenCanvas.width = upperCanvasContext.canvas.width;
	offscreenCanvas.height = upperCanvasContext.canvas.height;
	setSubroutineCanvasContext(upperCanvasContext, () => offscreenCanvas, {
		afterRender: ({ canvas, hitContext2d }) => {
			const hitCanvas = hitContext2d.canvas;
			upperCanvasContext.context2d.save();
			upperCanvasContext.context2d.drawImage(
				canvas,
				0,
				0,
				canvas.width,
				canvas.height,
				0,
				0,
				canvas.width,
				canvas.height
			);
			upperCanvasContext.hitContext2d.drawImage(
				hitCanvas,
				0,
				0,
				canvas.width,
				canvas.height,
				0,
				0,
				canvas.width,
				canvas.height
			);
			upperCanvasContext.context2d.restore();
		}
	});
</script>

{#if offscreenCanvas}
	<slot />
{/if}
