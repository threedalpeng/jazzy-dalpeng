<script lang="ts">
	import { onCanvasRender } from '..';
	import HitRegion from './HitRegion.svelte';

	export let active: boolean = false;
	export let x: number;
	export let y: number;
	export let width: number;
	export let height: number;
	export let fillStyle: string | CanvasGradient | CanvasPattern = '#000';
	export let strokeStyle: string | CanvasGradient | CanvasPattern = '#000';
	export let lineWidth: number = 1;

	const render = (ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) => {
		ctx.lineWidth = lineWidth;
		ctx.beginPath();
		ctx.rect(x, y, width, height);
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
