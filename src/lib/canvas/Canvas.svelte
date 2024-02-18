<script lang="ts">
	import { setCanvasContext } from './core/hooks';

	let canvas: HTMLCanvasElement;
	export let width = 100;
	export let height = 100;
	setCanvasContext(() => canvas);
</script>

<canvas
	bind:this={canvas}
	{...$$restProps}
	class="{$$props.class} object-contain object-center"
	{width}
	{height}
/>
{#if canvas}
	<slot />
{/if}
