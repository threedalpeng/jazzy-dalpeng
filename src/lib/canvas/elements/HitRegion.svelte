<script lang="ts" module>
	export type OnHitRegion = (detail: CanvasPointerEvent['detail']) => any;
	export interface ForwardHitRegionProps {
		active?: boolean;
		onup?: OnHitRegion;
		oncancel?: OnHitRegion;
		ondown?: OnHitRegion;
		onover?: OnHitRegion;
		onout?: OnHitRegion;
		onmove?: OnHitRegion;
		onclick?: OnHitRegion;
	}
</script>

<script lang="ts">
	import type { CanvasPointerEvent } from '../core/events';
	import { onCanvasHit } from '../core/hooks.svelte.ts';

	interface HitRegionProps extends ForwardHitRegionProps {
		render: (ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) => any;
	}
	const {
		active = true,
		render,
		onup = () => {},
		oncancel = () => {},
		ondown = () => {},
		onover = () => {},
		onout = () => {},
		onmove = () => {},
		onclick = () => {}
	}: HitRegionProps = $props();

	let orderNode: HTMLSpanElement;
	onCanvasHit(
		() => active,
		(ctx) => render(ctx),
		(ev) => {
			switch (ev.type) {
				case 'cancel':
					oncancel(ev.detail);
					break;
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
		},
		() => orderNode
	);
</script>

<span hidden bind:this={orderNode}></span>
