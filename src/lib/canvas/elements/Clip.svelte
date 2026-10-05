<script lang="ts">
	import type { Rect } from '#src/types/geometry.ts';
	import { onCanvasHit, onCanvasRender } from '../core/hooks.svelte.ts';

	interface ClipProps extends Rect {
		removeHitRegion?: boolean;
	}

	const { x, y, width, height, removeHitRegion = false }: ClipProps = $props();

	let orderNode: HTMLSpanElement;
	onCanvasRender(
		({ context2d: ctx }) => {
			ctx.clearRect(x, y, width, height);
		},
		() => orderNode
	);

	onCanvasHit(
		() => removeHitRegion,
		(hitCtx) => {
			hitCtx.clearRect(x, y, width, height);
		},
		() => {},
		() => orderNode
	);
</script>

<span hidden bind:this={orderNode}></span>
