<script lang="ts">
	import { Line } from '$/lib/canvas';
	import { onCanvasResize } from '$/lib/canvas/core/hooks';
	import Layer from '$/lib/canvas/elements/Layer.svelte';
	import Rectangle from '$/lib/canvas/elements/Rectangle.svelte';
	import { rangeFloat, rangeInt } from '$/utils/basic';
	import { getPianoRollContext } from './context';
	const {
		noteFrameStart,
		noteWidth,
		noteHeight,
		pianoWidth,
		beatPerBar,
		toCanvasOffsetX,
		toCanvasOffsetY,
		pitchStart,
		pitchEnd
	} = getPianoRollContext();

	interface TimelineProps {
		pitchHighlight?: number | 'mute' | null;
		onover?: (detail: { cursorPitch: number | 'mute' }) => unknown;
	}
	let { pitchHighlight = null, onover = () => {} }: TimelineProps = $props();

	const COLOR_ON_CURSOR = '#19ea2f';
	const COLOR_EVEN = '#cccccc';
	const COLOR_ODD = '#888888';
	const COLOR_MUTE_STROKE = '#666666';
	const COLOR_MUTE_FILL = '#eeeeee';

	let pitchRange = $derived(rangeInt($pitchStart, $pitchEnd + 1));
	let width = $state(100);
	let pitchOnCursor = $state<number | 'mute'>(-1);

	onCanvasResize(({ width: w }) => {
		width = w;
	});
</script>

<Layer name="Background">
	{#each pitchRange as i}
		<Rectangle
			active
			x={$pianoWidth}
			y={($pitchEnd - i) * $noteHeight}
			width={width - $pianoWidth}
			height={$noteHeight}
			strokeStyle={pitchOnCursor === i ? COLOR_ON_CURSOR : i % 2 ? COLOR_EVEN : COLOR_ODD}
			fillStyle={pitchOnCursor === i ? COLOR_ON_CURSOR : i % 2 ? COLOR_EVEN : COLOR_ODD}
			onover={() => {
				pitchOnCursor = i;
				onover({ cursorPitch: pitchOnCursor });
			}}
		></Rectangle>
	{/each}
	<Rectangle
		active
		x={$pianoWidth}
		y={($pitchEnd - $pitchStart + 2) * $noteHeight}
		width={width - $pianoWidth}
		height={$noteHeight}
		strokeStyle={pitchOnCursor === 'mute' ? COLOR_ON_CURSOR : COLOR_MUTE_STROKE}
		fillStyle={pitchOnCursor === 'mute' ? COLOR_ON_CURSOR : COLOR_MUTE_FILL}
		onover={() => {
			pitchOnCursor = 'mute';
			onover({ cursorPitch: pitchOnCursor });
		}}
	></Rectangle>
	{#each pitchRange.filter((x) => x % 12 === 0) as i}
		<Line
			points={[
				{ x: 0, y: ($pitchEnd - i + 1) * $noteHeight },
				{ x: width, y: ($pitchEnd - i + 1) * $noteHeight }
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
			y={$toCanvasOffsetY(pitchHighlight) - 1}
			width={width - $pianoWidth}
			height={$noteHeight + 2}
			strokeStyle={'#9abcde'}
			fillStyle={'#abcdef'}
			onover={() => {
				if (pitchHighlight !== null) onover({ cursorPitch: pitchHighlight });
			}}
		></Rectangle>
	{/if}
</Layer>
<Layer name="Vertical Lines">
	<!--Per Beat-->
	{#each rangeFloat( $noteFrameStart, $noteFrameStart + (width - $pianoWidth) / $noteWidth, { gap: 1 / $beatPerBar, quantized: true } ) as i}
		<Line
			points={[
				{ x: $toCanvasOffsetX(i), y: 0 },
				{ x: $toCanvasOffsetX(i), y: 8 * $noteHeight * 12 }
			]}
			strokeStyle="#1c1c1c"
		></Line>
	{/each}
	<!--Per Bar-->
	{#each rangeFloat( $noteFrameStart, $noteFrameStart + (width - $pianoWidth) / $noteWidth, { gap: 1, quantized: true } ) as i}
		<Line
			points={[
				{ x: $toCanvasOffsetX(i), y: 0 },
				{ x: $toCanvasOffsetX(i), y: 8 * $noteHeight * 12 }
			]}
			strokeStyle="black"
			lineWidth={2}
		></Line>
	{/each}
</Layer>
