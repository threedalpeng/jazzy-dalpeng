<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { CanvasPointerEvent } from '../core/events';
	import { onCanvasHit } from '../core/hooks';

	export let active: boolean = true;
	export let render: (ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) => any;

	const dispatch = createEventDispatcher<{
		up: CanvasPointerEvent['detail'];
		down: CanvasPointerEvent['detail'];
		over: CanvasPointerEvent['detail'];
		out: CanvasPointerEvent['detail'];
		move: CanvasPointerEvent['detail'];
		click: CanvasPointerEvent['detail'];
	}>();

	onCanvasHit(active, render, (ev) => {
		dispatch(ev.type, ev.detail);
	});
</script>
