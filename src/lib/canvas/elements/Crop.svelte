<script lang="ts">
	import type { Rect } from '$/types/geometry';
	import { getCanvasContext } from '../core/hooks';
	import { setSubroutineCanvasContext } from '../core/subroutine-context';
	import Rectangle from './Rectangle.svelte';

	export let width: number;
	export let height: number;
	export let sourceArea: Partial<Rect> = { x: 0, y: 0 };
	export let destArea: Partial<Rect> = { x: 0, y: 0 };
	export let debug: boolean = false;

	/* Outer Context */
	const upperCanvasContext = getCanvasContext();

	/* Inner Context */
	const offscreenCanvas = document.createElement('canvas');
	offscreenCanvas.width = width;
	offscreenCanvas.height = height;
	setSubroutineCanvasContext(upperCanvasContext, () => offscreenCanvas, {
		afterRender: ({ canvas, hitContext2d }) => {
			const hitCanvas = hitContext2d.canvas;
			upperCanvasContext.context2d.drawImage(
				canvas,
				sourceArea.x ?? 0,
				sourceArea.y ?? 0,
				sourceArea.width ?? canvas.width,
				sourceArea.height ?? canvas.height,
				destArea.x ?? 0,
				destArea.y ?? 0,
				destArea.width ?? sourceArea.width ?? canvas.width,
				destArea.height ?? sourceArea.height ?? canvas.height
			);
			upperCanvasContext.hitContext2d.drawImage(
				hitCanvas,
				sourceArea.x ?? 0,
				sourceArea.y ?? 0,
				sourceArea.width ?? hitCanvas.width,
				sourceArea.height ?? hitCanvas.height,
				destArea.x ?? 0,
				destArea.y ?? 0,
				destArea.width ?? sourceArea.width ?? hitCanvas.width,
				destArea.height ?? sourceArea.height ?? hitCanvas.height
			);
		}
	});
</script>

{#if offscreenCanvas}
	<slot />
	{#if debug}
		<Rectangle
			fillStyle="transparent"
			strokeStyle="blue"
			x={sourceArea.x ?? 0}
			y={sourceArea.y ?? 0}
			width={sourceArea.width ?? width}
			height={sourceArea.height ?? height}
			lineWidth={4}
			active={false}
		/>
	{/if}
{/if}
