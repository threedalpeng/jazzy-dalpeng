<script lang="ts">
	import Ellipse from './Ellipse.svelte';
	import type { ForwardHitRegionProps } from './HitRegion.svelte';

	interface CircleProps {
		x: number;
		y: number;
		radius: number;
		fillStyle?: CanvasStyle;
		strokeStyle?: CanvasStyle;
		lineWidth?: number;
	}

	const {
		x,
		y,
		radius,
		fillStyle = '#000',
		strokeStyle = '#000',
		lineWidth = 1,
		active = false,
		...rest
	}: CircleProps & ForwardHitRegionProps = $props();
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
	{...rest}
/>
