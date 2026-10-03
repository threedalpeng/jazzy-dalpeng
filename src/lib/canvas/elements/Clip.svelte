<script lang="ts">
	import type { Rect } from '#src/types/geometry.ts';
	import { onCanvasHit, onCanvasRender } from '../core/hooks.svelte.ts';

	interface ClipProps extends Rect {
		removeHitRegion?: boolean;
	}

	const { x, y, width, height, removeHitRegion = false }: ClipProps = $props();

	onCanvasRender(({ context2d: ctx }) => {
		ctx.clearRect(x, y, width, height);
	});

	onCanvasHit(
		() => removeHitRegion,
		(hitCtx) => {
			hitCtx.clearRect(x, y, width, height);
		},
		() => {}
	);
</script>
