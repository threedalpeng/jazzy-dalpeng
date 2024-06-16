<script lang="ts">
	import { onCanvasRender } from '..';
	import HitRegion, { type ForwardHitRegionProps } from './HitRegion.svelte';

	interface RectangleProps {
		x: number;
		y: number;
		width: number;
		height: number;
		fillStyle?: CanvasStyle;
		strokeStyle?: CanvasStyle;
		lineWidth?: number;
	}

	const {
		x,
		y,
		width,
		height,
		fillStyle = '#000',
		strokeStyle = '#000',
		lineWidth = 1,
		active = false,
		...rest
	}: RectangleProps & ForwardHitRegionProps = $props();

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

<HitRegion {active} {render} {...rest}></HitRegion>
