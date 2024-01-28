<script lang="ts">
	import { onCanvasHit, onCanvasRender } from '../core';

	export let x: number;
	export let y: number;
	export let width: number;
	export let height: number;

	onCanvasRender(({ context2d: ctx }) => {
		ctx.clearRect(x, y, width, height);
	});

	onCanvasHit(
		true,
		(hitCtx) => {
			hitCtx.clearRect(x, y, width, height);
		},
		(ev) => {}
	);
</script>
