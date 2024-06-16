<script lang="ts">
	import { Circle } from '$/lib/canvas';
	import HitRegion, { type OnHitRegion } from '$/lib/canvas/elements/HitRegion.svelte';
	import { tweened } from 'svelte/motion';
	import { getFingerBoardContext } from '../context';

	interface FingerBoardPoisitionIndicatorProps {
		leftX: number;
		centerY: number;
		onclick?: OnHitRegion;
	}

	const { leftX, centerY, onclick }: FingerBoardPoisitionIndicatorProps = $props();

	const { FRET_GAP, STRING_GAP, FINGER_RADIUS } = getFingerBoardContext();

	let hovering = $state<boolean>(false);
	const indicatorSize = tweened<number>(undefined, {
		duration: 300
	});
	$effect(() => {
		$indicatorSize = hovering ? FINGER_RADIUS : 0;
	});
</script>

<Circle
	active={false}
	x={leftX + FRET_GAP / 2}
	y={centerY}
	fillStyle="#888888"
	strokeStyle="#888888"
	radius={$indicatorSize}
></Circle>
<HitRegion
	render={(ctx) => {
		const width = FRET_GAP;
		const height = STRING_GAP;
		ctx.fillRect(leftX, centerY - height / 2, width, height);
	}}
	{onclick}
	onout={() => {
		hovering = false;
	}}
	onover={() => {
		hovering = true;
	}}
></HitRegion>
