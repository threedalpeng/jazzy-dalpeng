<script lang="ts">
	import { Line } from '$/lib/canvas';
	import { onCanvasResize } from '$/lib/canvas/core/hooks';
	import Layer from '$/lib/canvas/elements/Layer.svelte';
	import Rectangle from '$/lib/canvas/elements/Rectangle.svelte';
	import { rangeFloat, rangeInt } from '$/utils/basic';
	import { createEventDispatcher } from 'svelte';
	import { getPianoRollContext } from './context';
	const {
		noteFrameStart,
		noteWidth,
		noteHeight,
		pianoWidth,
		pianoHeight,
		beatPerBar,
		quantizingUnit
	} = getPianoRollContext();

	export let pitchStart: number;
	export let pitchEnd: number;
	export let pitchHighlight: number | 'mute' | null = null;

	$: pitchRange = rangeInt(pitchStart, pitchEnd + 1);
	const dispatch = createEventDispatcher<{ over: { cursorPitch: number | 'mute' } }>();

	let width = 100;
	onCanvasResize(({ width: w }) => {
		width = w;
	});
</script>

<Layer name="Background">
	{#each pitchRange as i}
		<Rectangle
			active
			x={$pianoWidth}
			y={(pitchEnd - i) * $noteHeight}
			width={width - $pianoWidth}
			height={$noteHeight}
			strokeStyle={i % 2 ? '#cccccc' : '#888888'}
			fillStyle={i % 2 ? '#cccccc' : '#888888'}
			on:over={(e) => {
				dispatch('over', { cursorPitch: i });
			}}
		></Rectangle>
	{/each}
	<Rectangle
		active
		x={$pianoWidth}
		y={(pitchEnd - pitchStart + 2) * $noteHeight}
		width={width - $pianoWidth}
		height={$noteHeight}
		strokeStyle={'#666666'}
		fillStyle={'#eeeeee'}
		on:over={(e) => {
			dispatch('over', { cursorPitch: 'mute' });
		}}
	></Rectangle>
	{#each pitchRange.filter((x) => x % 12 === 0) as i}
		<Line
			points={[
				{ x: 0, y: (pitchEnd - i + 1) * $noteHeight },
				{ x: width, y: (pitchEnd - i + 1) * $noteHeight }
			]}
			strokeStyle="black"
		></Line>
	{/each}
</Layer>
<Layer name="Selected Pitch">
	<!--Selected-->
	{#if pitchHighlight !== null}
		<Rectangle
			active
			x={$pianoWidth}
			y={(pitchEnd - (pitchHighlight !== 'mute' ? pitchHighlight : pitchStart - 2)) * $noteHeight -
				1}
			width={width - $pianoWidth}
			height={$noteHeight + 2}
			strokeStyle={'#9abcde'}
			fillStyle={'#abcdef'}
			on:over={(e) => {
				if (pitchHighlight !== null) dispatch('over', { cursorPitch: pitchHighlight });
			}}
		></Rectangle>
	{/if}
</Layer>
<Layer name="Vertical Lines">
	<!--Per Beat-->
	{#each rangeFloat( $noteFrameStart, $noteFrameStart + (width - $pianoWidth) / $noteWidth, { gap: 1 / $beatPerBar, quantized: true } ) as i}
		<Line
			points={[
				{ x: $pianoWidth + $noteWidth * (i - $noteFrameStart), y: 0 },
				{ x: $pianoWidth + $noteWidth * (i - $noteFrameStart), y: 8 * $noteHeight * 12 }
			]}
			strokeStyle="#1c1c1c"
		></Line>
	{/each}
	<!--Per Bar-->
	{#each rangeFloat( $noteFrameStart, $noteFrameStart + (width - $pianoWidth) / $noteWidth, { gap: 1, quantized: true } ) as i}
		<Line
			points={[
				{ x: $pianoWidth + $noteWidth * (i - $noteFrameStart), y: 0 },
				{ x: $pianoWidth + $noteWidth * (i - $noteFrameStart), y: 8 * $noteHeight * 12 }
			]}
			strokeStyle="black"
			lineWidth={2}
		></Line>
	{/each}
</Layer>
