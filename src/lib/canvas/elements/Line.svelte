<script lang="ts">
	import { onCanvasRender } from '../core/hooks';
	import HitRegion from './HitRegion.svelte';

	export let active: boolean = false;
	export let points: { x: number; y: number }[];
	export let strokeStyle: string | CanvasGradient | CanvasPattern = '#000';
	export let lineCap: CanvasLineCap = 'butt';
	export let lineWidth: number = 1;

	const render = (ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) => {
		ctx.lineCap = lineCap;
		ctx.lineWidth = lineWidth;
		ctx.beginPath();
		const start = points[0];
		ctx.moveTo(start.x, start.y);
		points.slice(1).forEach((point) => {
			ctx.lineTo(point.x, point.y);
		});
		ctx.stroke();
	};

	onCanvasRender(({ context2d: ctx }) => {
		ctx.strokeStyle = strokeStyle;
		render(ctx);
	});
</script>

<HitRegion {active} {render} on:up on:down on:move on:click on:over on:out></HitRegion>
