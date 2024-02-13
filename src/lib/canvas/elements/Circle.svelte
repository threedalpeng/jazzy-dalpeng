<script lang="ts">
	import Ellipse from './Ellipse.svelte';

	export let active: boolean = true;
	export let x: number;
	export let y: number;
	export let radius: number;
	export let fillStyle: CanvasStyle = '#000';
	export let strokeStyle: CanvasStyle = '#000';
	export let lineWidth: number = 1;
</script>

<Ellipse
	{x}
	{y}
	radiusX={radius}
	radiusY={radius}
	{fillStyle}
	{strokeStyle}
	{lineWidth}
	{active}
	on:up
	on:down
	on:move
	on:click
	on:over
	on:out
/>
