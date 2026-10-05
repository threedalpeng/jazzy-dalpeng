<script lang="ts">
	import type { Rect } from '#src/types/geometry.ts';
	import type { Snippet } from 'svelte';
	import { getCanvasContext } from '../core/hooks.svelte.ts';
	import { setSubroutineCanvasContext } from '../core/subroutine-context';
	import Rectangle from './Rectangle.svelte';

	interface CropProps {
		width: number;
		height: number;
		sourceArea?: Partial<Rect>;
		destArea?: Partial<Rect>;
		debug?: boolean;
		cached?: boolean;
		cacheKey?: unknown;
		children: Snippet;
	}

	const {
		width,
		height,
		sourceArea = { x: 0, y: 0 },
		destArea = { x: 0, y: 0 },
		debug = false,
		cached = false,
		cacheKey,
		children
	}: CropProps = $props();

	/* Outer Context */
	const upperCanvasContext = getCanvasContext();

	/* Inner Context */
	let orderNode: HTMLSpanElement;
	const offscreenCanvas = document.createElement('canvas');
	setSubroutineCanvasContext(upperCanvasContext, () => offscreenCanvas, {
		orderNode: () => orderNode,
		dimensions: () => ({
			width,
			height,
			scale:
				upperCanvasContext.pixelScale *
				Math.max(
					(destArea.width ?? sourceArea.width ?? width) / (sourceArea.width ?? width),
					(destArea.height ?? sourceArea.height ?? height) / (sourceArea.height ?? height)
				)
		}),
		cache: () => (cached ? { key: cacheKey } : undefined),
		afterRender: ({ canvas, hitContext2d }) => {
			const scaleX = canvas.width / width;
			const scaleY = canvas.height / height;
			const hitCanvas = hitContext2d.canvas;
			upperCanvasContext.context2d.drawImage(
				canvas,
				(sourceArea.x ?? 0) * scaleX,
				(sourceArea.y ?? 0) * scaleY,
				(sourceArea.width ?? width) * scaleX,
				(sourceArea.height ?? height) * scaleY,
				destArea.x ?? 0,
				destArea.y ?? 0,
				destArea.width ?? sourceArea.width ?? width,
				destArea.height ?? sourceArea.height ?? height
			);
			upperCanvasContext.hitContext2d.drawImage(
				hitCanvas,
				sourceArea.x ?? 0,
				sourceArea.y ?? 0,
				sourceArea.width ?? width,
				sourceArea.height ?? height,
				destArea.x ?? 0,
				destArea.y ?? 0,
				destArea.width ?? sourceArea.width ?? width,
				destArea.height ?? sourceArea.height ?? height
			);
		}
	});
</script>

<span hidden bind:this={orderNode}>
	{@render children()}
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
</span>
