<script lang="ts">
	import { onCanvasRender } from '../core/hooks';
	import HitRegion, { type ForwardHitRegionProps } from './HitRegion.svelte';

	interface LineProps {
		points: { x: number; y: number }[];
		strokeStyle: CanvasStyle;
		lineCap?: CanvasLineCap;
		lineWidth?: number;
	}
	const {
		points,
		strokeStyle = '#000',
		lineCap = 'butt',
		lineWidth = 1,
		active = false,
		...rest
	}: LineProps & ForwardHitRegionProps = $props();

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

<HitRegion {active} {render} {...rest}></HitRegion>
