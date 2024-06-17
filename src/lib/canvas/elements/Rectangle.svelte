<script lang="ts">
	import { onCanvasRender } from '..';
	import HitRegion, { type ForwardHitRegionProps } from './HitRegion.svelte';
	import type { CanvasStyle } from './types';

	interface RectangleProps {
		x: number;
		y: number;
		width: number;
		height: number;
		fillStyle?: CanvasStyle;
		strokeStyle?: CanvasStyle;
		lineWidth?: number;
		rounded?: number;
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
		rounded = 0,
		...rest
	}: RectangleProps & ForwardHitRegionProps = $props();

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

<HitRegion {active} {render} {...rest}></HitRegion>
