<script lang="ts">
	import { Circle } from '$/lib/canvas';
	import HitRegion from '$/lib/canvas/elements/HitRegion.svelte';
	import { tweened } from 'svelte/motion';
	import { getFingerBoardContext } from '../context';

	export let leftX: number;
	export let centerY: number;
	const { FRET_GAP, STRING_GAP, FINGER_RADIUS } = getFingerBoardContext();

	let hovering: boolean = false;
	const indicatorSize = tweened<number>(undefined, {
		duration: 300
	});
	$: $indicatorSize = hovering ? FINGER_RADIUS : 0;
</script>

<Circle
	active={false}
	x={leftX + FRET_GAP / 2}
	y={centerY}
	fillStyle="#bbbbbb"
	strokeStyle="#bbbbbb"
	radius={$indicatorSize}
></Circle>
<HitRegion
	render={(ctx) => {
		const width = FRET_GAP;
		const height = STRING_GAP;
		ctx.fillRect(leftX, centerY - height / 2, width, height);
	}}
	on:click
	on:out={() => {
		hovering = false;
	}}
	on:over={() => {
		hovering = true;
	}}
></HitRegion>
