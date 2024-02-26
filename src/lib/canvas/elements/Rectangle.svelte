<script lang="ts">
	import { onCanvasRender } from '..';
	import HitRegion from './HitRegion.svelte';

	export let active: boolean = false;
	export let x: number;
	export let y: number;
	export let width: number;
	export let height: number;
	export let fillStyle: CanvasStyle = '#000';
	export let strokeStyle: CanvasStyle = '#000';
	export let lineWidth: number = 1;
	export let rounded: number = 0;

	const render = (ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) => {
		const xr = rounded < width / 2 ? rounded : width / 2;
		const yr = rounded < height / 2 ? rounded : height / 2;

		ctx.lineWidth = lineWidth;
		ctx.beginPath();
		ctx.ellipse(x + xr, y + yr, xr, yr, 0, Math.PI, Math.PI * 1.5);
		ctx.lineTo(x + width - xr, y);
		ctx.ellipse(x + width - xr, y + yr, xr, yr, 0, Math.PI * 1.5, Math.PI * 2);
		ctx.lineTo(x + width, y + height - yr);
		ctx.ellipse(x + width - xr, y + height - yr, xr, yr, 0, 0, Math.PI * 0.5);
		ctx.lineTo(x + xr, y + height);
		ctx.ellipse(x + xr, y + height - yr, xr, yr, 0, Math.PI * 0.5, Math.PI * 1);
		ctx.lineTo(x, y + yr);
		ctx.fill();
		ctx.stroke();
	};

	onCanvasRender(({ context2d: ctx }) => {
		ctx.fillStyle = fillStyle;
		ctx.strokeStyle = strokeStyle;
		render(ctx);
	});
</script>

<HitRegion {active} {render} on:up on:down on:move on:click on:over on:out></HitRegion>
