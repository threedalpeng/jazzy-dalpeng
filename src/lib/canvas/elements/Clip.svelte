<script lang="ts">
	import { onCanvasHit, onCanvasRender } from '../core/hooks';

	export let x: number;
	export let y: number;
	export let width: number;
	export let height: number;
	export let removeHitRegion: boolean = false;

	onCanvasRender(({ context2d: ctx }) => {
		ctx.clearRect(x, y, width, height);
	});

	onCanvasHit(
		removeHitRegion,
		(hitCtx) => {
			hitCtx.clearRect(x, y, width, height);
		},
		(ev) => {}
	);
</script>
