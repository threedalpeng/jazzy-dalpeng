<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { onCanvasRender } from '..';
	import { onCanvasHit } from '../core';
	import HitRegion from './HitRegion.svelte';

	export let active: boolean = true;
	export let x: number;
	export let y: number;
	export let radiusX: number;
	export let radiusY: number;
	export let rotation: number = 0;
	export let startAngle: number = 0;
	export let endAngle: number = 2 * Math.PI;
	export let counterclockwise: boolean = false;
	export let fillStyle: string | CanvasGradient | CanvasPattern = '#000';
	export let strokeStyle: string | CanvasGradient | CanvasPattern = '#000';
	export let lineWidth: number = 1;

	const render = (ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) => {
		ctx.lineWidth = lineWidth;
		ctx.beginPath();
		ctx.ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, counterclockwise);
		ctx.stroke();
		ctx.fill();
	};

	onCanvasRender(({ context2d: ctx }) => {
		ctx.fillStyle = fillStyle;
		ctx.strokeStyle = strokeStyle;
		render(ctx);
	});
</script>

<HitRegion {active} {render} on:hit></HitRegion>
