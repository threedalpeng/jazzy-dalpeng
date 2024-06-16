<script lang="ts" context="module">
	export type OnHitRegion = (detail: CanvasPointerEvent['detail']) => any;
	export interface ForwardHitRegionProps {
		active?: boolean;
		onup?: OnHitRegion;
		ondown?: OnHitRegion;
		onover?: OnHitRegion;
		onout?: OnHitRegion;
		onmove?: OnHitRegion;
		onclick?: OnHitRegion;
	}
</script>

<script lang="ts">
	import type { CanvasPointerEvent, OnHitCallback } from '../core/events';
	import { onCanvasHit } from '../core/hooks';

	interface HitRegionProps extends ForwardHitRegionProps {
		render: (ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) => any;
	}
	const {
		active = true,
		render,
		onup = () => {},
		ondown = () => {},
		onover = () => {},
		onout = () => {},
		onmove = () => {},
		onclick = () => {}
	}: HitRegionProps = $props();

	onCanvasHit(active, render, (ev) => {
		switch (ev.type) {
			case 'up':
				onup(ev.detail);
				break;
			case 'down':
				ondown(ev.detail);
				break;
			case 'over':
				onover(ev.detail);
				break;
			case 'out':
				onout(ev.detail);
				break;
			case 'move':
				onmove(ev.detail);
				break;
			case 'click':
				onclick(ev.detail);
				break;
		}
	});
</script>
