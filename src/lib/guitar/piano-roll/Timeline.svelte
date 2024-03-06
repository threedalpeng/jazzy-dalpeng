<script lang="ts">
	import { Line } from '$/lib/canvas';
	import { onCanvasResize } from '$/lib/canvas/core/hooks';
	import Layer from '$/lib/canvas/elements/Layer.svelte';
	import Rectangle from '$/lib/canvas/elements/Rectangle.svelte';
	import { createEventDispatcher } from 'svelte';
	import { getPianoRollContext } from './context';
	import { range } from '$/utils/basic';
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

	$: pitchRange = range(pitchStart, pitchEnd + 1);
	$: console.log(pitchRange.filter((x) => x % 12 === 0).map((x) => pitchEnd - x));
	const dispatch = createEventDispatcher<{ over: { cursorPitch: number | 'mute' } }>();

	let width = 100;
	onCanvasResize(({ width: w }) => {
		width = w;
	});
</script>

<Layer>
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
<Layer>
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
<Layer>
	{#each new Array(Math.floor((width - $pianoWidth) / ($noteWidth / 4))) as _, i}
		<Line
			points={[
				{ x: $pianoWidth + ($noteWidth * (i + 1)) / 4, y: 0 },
				{ x: $pianoWidth + ($noteWidth * (i + 1)) / 4, y: 8 * $noteHeight * 12 }
			]}
			strokeStyle="#1c1c1c"
		></Line>
	{/each}
	{#each new Array(Math.floor((width - $pianoWidth) / $noteWidth)) as _, i}
		<Line
			points={[
				{ x: $pianoWidth + $noteWidth * (i + 1), y: 0 },
				{ x: $pianoWidth + $noteWidth * (i + 1), y: 8 * $noteHeight * 12 }
			]}
			strokeStyle="black"
		></Line>
	{/each}
</Layer>
