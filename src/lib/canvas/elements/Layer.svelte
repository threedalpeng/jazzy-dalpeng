<script lang="ts">
	import type { Point } from '$/types/geometry';
	import type { Snippet } from 'svelte';
	import { getCanvasContext } from '../core/hooks';
	import { setSubroutineCanvasContext } from '../core/subroutine-context';

	interface LayerProps {
		name?: string;
		offset?: Partial<Point>;
		children: Snippet;
	}

	const { name = '', offset = { x: 0, y: 0 }, children }: LayerProps = $props();

	/* Outer Context */
	const upperCanvasContext = getCanvasContext();

	/* Inner Context */
	const offscreenCanvas = document.createElement('canvas');
	offscreenCanvas.className = `offcanvas-${name}`;

	offscreenCanvas.width = upperCanvasContext.canvas.width;
	offscreenCanvas.height = upperCanvasContext.canvas.height;
	upperCanvasContext.onResize(({ width, height }) => {
		offscreenCanvas.width = width;
		offscreenCanvas.height = height;
	});
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
				offset.x ?? 0,
				offset.y ?? 0,
				canvas.width,
				canvas.height
			);
			upperCanvasContext.hitContext2d.drawImage(
				hitCanvas,
				0,
				0,
				canvas.width,
				canvas.height,
				offset.x ?? 0,
				offset.y ?? 0,
				canvas.width,
				canvas.height
			);
			upperCanvasContext.context2d.restore();
		}
	});
</script>

{#if offscreenCanvas}
	{@render children()}
{/if}
