<script lang="ts">
	import { onCanvasRender } from '..';
	import HitRegion, { type ForwardHitRegionProps } from './HitRegion.svelte';

	interface EllipseProps {
		x: number;
		y: number;
		radiusX: number;
		radiusY: number;
		rotation?: number;
		startAngle?: number;
		endAngle?: number;
		counterclockwise?: boolean;
		fillStyle?: CanvasStyle;
		strokeStyle?: CanvasStyle;
		lineWidth?: number;
	}

	const {
		x,
		y,
		radiusX,
		radiusY,
		rotation = 0,
		startAngle = 0,
		endAngle = 2 * Math.PI,
		counterclockwise = false,
		fillStyle = '#000',
		strokeStyle = '#000',
		lineWidth = 1,
		active = false,
		...rest
	}: EllipseProps & ForwardHitRegionProps = $props();

	const render = (ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) => {
		ctx.lineWidth = lineWidth;
		ctx.beginPath();
		ctx.ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, counterclockwise);
		ctx.stroke();
		ctx.fill();
	};

	let orderNode: HTMLSpanElement;
	onCanvasRender(
		({ context2d: ctx }) => {
			ctx.fillStyle = fillStyle;
			ctx.strokeStyle = strokeStyle;
			render(ctx);
		},
		() => orderNode
	);
</script>

<span hidden bind:this={orderNode}></span>
<HitRegion {active} {render} {...rest}></HitRegion>
