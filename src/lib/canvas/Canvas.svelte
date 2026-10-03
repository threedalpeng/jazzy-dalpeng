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
	setCanvasContext(() => canvas);
</script>

<canvas
	bind:this={canvas}
	{...rest}
	class="{rest.class} touch-none object-contain object-center"
	{width}
	{height}
></canvas>
{@render children()}
