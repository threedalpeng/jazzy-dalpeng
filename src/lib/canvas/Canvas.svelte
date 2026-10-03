<script lang="ts">
	import type { HTMLCanvasAttributes } from 'svelte/elements';
	import { setCanvasContext } from './core/hooks.svelte.ts';
	import type { Snippet } from 'svelte';

	interface CanvasProps {
		children: Snippet;
	}

	const {
		width = 100,
		height = 100,
		children,
		...rest
	}: CanvasProps & HTMLCanvasAttributes = $props();

	let canvas: HTMLCanvasElement;
	setCanvasContext(
		() => canvas,
		() => ({
			width: Number(width),
			height: Number(height),
			scale: Math.max(
				1,
				(window.devicePixelRatio || 1) *
					Math.max(
						(canvas?.getBoundingClientRect().width || Number(width)) / Number(width),
						(canvas?.getBoundingClientRect().height || Number(height)) / Number(height)
					)
			)
		})
	);
</script>

<canvas
	bind:this={canvas}
	{...rest}
	class="{rest.class} touch-none object-contain object-center"
	{width}
	{height}
	data-logical-width={width}
	data-logical-height={height}
	style={`--canvas-width: ${width}px; --canvas-height: ${height}px; ${rest.style ?? ''}`}
></canvas>
{@render children()}

<style>
	:where(canvas) {
		width: var(--canvas-width);
		height: auto;
	}
</style>
