<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { onCanvasHit } from '../core';

	export let active: boolean = true;
	export let render: (ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) => any;

	const dispatch = createEventDispatcher<{ hit: MouseEvent }>();

	onCanvasHit(active, render, (ev) => {
		dispatch('hit', ev);
	});
</script>
