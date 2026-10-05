<script lang="ts">
	import type { HTMLCanvasAttributes } from 'svelte/elements';
	import { setCanvasContext } from './core/hooks.svelte.ts';
	import { onMount, type Snippet } from 'svelte';

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
	let layers: HTMLSpanElement;
	const context = setCanvasContext(
		() => canvas,
		() => {
			const logicalWidth = Number(width);
			const logicalHeight = Number(height);
			const bounds = canvas?.getBoundingClientRect();
			return {
				width: logicalWidth,
				height: logicalHeight,
				scale: Math.max(
					1,
					(window.devicePixelRatio || 1) *
						Math.max(
							(bounds?.width || logicalWidth) / logicalWidth,
							(bounds?.height || logicalHeight) / logicalHeight
						)
				)
			};
		}
	);
	onMount(() => context.observeOrder(layers));
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
<span hidden bind:this={layers}>{@render children()}</span>

<style>
	:where(canvas) {
		width: var(--canvas-width);
		height: auto;
	}
</style>
