<script lang="ts">
	import { setCanvasContext } from './core';

	let canvas: HTMLCanvasElement;
	export let width = 100;
	export let height = 100;
	setCanvasContext(() => canvas);
</script>

<canvas
	bind:this={canvas}
	class="w-screen object-contain object-center md:w-auto"
	{width}
	{height}
/>
{#if canvas}
	<slot />
{/if}
