<script lang="ts">
	import { setCanvasContext } from './core/hooks';

	let canvas: HTMLCanvasElement;
	export let width = 100;
	export let height = 100;
	setCanvasContext(() => canvas);

	$: {
		if (canvas) {
			canvas.width = width;
			canvas.height = height;
		}
	}
</script>

<canvas
	bind:this={canvas}
	{...$$restProps}
	class="{$$props.class ?? ''} object-contain object-center"
	{width}
	{height}
	on:pointermove
	on:pointerdown
	on:pointerup
	on:pointerenter
	on:pointerleave
	on:pointerout
	on:pointerover
/>
{#if canvas}
	<slot />
{/if}
