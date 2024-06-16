<script lang="ts" context="module">
	export interface PianoRollNote {
		time: NoteTimestamp;
		pitch: number | 'mute';
	}
</script>

<script lang="ts">
	import { Line } from '$/lib/canvas';
	import Canvas from '$/lib/canvas/Canvas.svelte';
	import Clip from '$/lib/canvas/elements/Clip.svelte';
	import Layer from '$/lib/canvas/elements/Layer.svelte';
	import Rectangle from '$/lib/canvas/elements/Rectangle.svelte';
	import Text from '$/lib/canvas/elements/Text.svelte';
	import type { NoteTimestamp } from '$/lib/practice/types';
	import { rangeFloat, rangeInt } from '$/utils/basic';
	import Timeline from './Timeline.svelte';
	import { getPianoRollContext } from './context';

	let innerWidth = $state(window.innerWidth);
	let innerHeight = $state(window.innerHeight);

	interface Props {
		pitchStart?: number;
		pitchEnd?: number;
		pitchHighlight?: number | 'mute' | null;
		notes?: PianoRollNote[];
		onselect?: (note: PianoRollNote) => any;
	}
	let {
		pitchStart = 40,
		pitchEnd = 84,
		pitchHighlight = null,
		notes = [],
		onselect = () => {}
	}: Props = $props();
	let pitchRange = $derived(rangeInt(pitchStart, pitchEnd + 1));

	$inspect(notes);

	const {
		timeGridlineHeight,
		noteFrameStart,
		noteWidth,
		noteHeight,
		pianoWidth,
		pianoHeight,
		beatPerBar,
		quantizingUnit
	} = getPianoRollContext();

	let hoverPointNote = $state<number>(0);
	let hoverPointX = $derived((hoverPointNote - $noteFrameStart) * $noteWidth + $pianoWidth);
	$effect(() => {
		$noteWidth = innerWidth / 5;
	});
	$quantizingUnit = 1 / 24;

	let isDragging = $state<boolean>(false);
	let dragButton = $state<number>(0);
	let cursorPitch = $state<number | 'mute'>(0);
	let selectedPitch = $derived(pitchHighlight ?? cursorPitch);
	let dragStartNote = $state(0);
	let dragEndNote = $state(0);

	function updateNoteFrameStart(deltaX: number) {
		const newNoteFrameStart = $noteFrameStart + deltaX * 0.05;
		$noteFrameStart = newNoteFrameStart > 0 ? newNoteFrameStart : 0;
	}

	let isScrollingOnX = $derived(isDragging && dragButton === 2);
	let isSelecting = $derived(isDragging && dragButton === 0);
</script>

<Canvas
	width={innerWidth}
	height={$noteHeight * (pitchEnd - pitchStart + 3) + $timeGridlineHeight}
	onpointermove={(e) => {
		const note = (e.offsetX - $pianoWidth) / $noteWidth + $noteFrameStart;
		hoverPointNote = Math.max(Math.round(note / $quantizingUnit) * $quantizingUnit, 0);
		if (isSelecting) {
			dragEndNote = hoverPointNote;
		}

		if (isScrollingOnX) {
			$noteFrameStart = Math.max($noteFrameStart - e.movementX / $noteWidth, 0);
		}
	}}
	onpointerdown={(e) => {
		isDragging = true;
		dragButton = e.button;
		if (dragButton === 0) {
			dragStartNote = hoverPointNote;
		}
	}}
	onpointerup={(e) => {
		isDragging = false;
		if (dragButton === 0) {
			if (dragEndNote > dragStartNote) {
				onselect({
					time: { start: dragStartNote, duration: dragEndNote - dragStartNote },
					pitch: selectedPitch
				});
			}
		}
		dragStartNote = 0;
		dragEndNote = 0;
	}}
	onwheel={(e) => {
		const newNoteWidth = $noteWidth + e.deltaY * -0.04;
		$noteWidth = newNoteWidth > 16 ? newNoteWidth : 16;
		updateNoteFrameStart(e.deltaX);
	}}
>
	<Layer offset={{ y: $timeGridlineHeight }}>
		<Timeline
			{pitchStart}
			{pitchEnd}
			{pitchHighlight}
			onover={(detail) => {
				if (!isDragging) cursorPitch = detail.cursorPitch;
			}}
		/>
		<Layer name="Notes">
			{#each notes as note}
				{#if note.pitch !== 'mute'}
					<Rectangle
						active={true}
						x={$pianoWidth + $noteWidth * (note.time.start - $noteFrameStart)}
						y={(pitchEnd - note.pitch) * $noteHeight}
						width={$noteWidth * note.time.duration}
						height={$noteHeight}
						strokeStyle="#111111"
						fillStyle="#ffffff"
						rounded={$noteHeight / 2}
						onclick={() => {
							console.log(note);
						}}
					></Rectangle>
				{/if}
			{/each}
			{#if isSelecting}
				<Rectangle
					x={$pianoWidth + $noteWidth * (dragStartNote - $noteFrameStart)}
					y={(pitchEnd - (selectedPitch !== 'mute' ? selectedPitch : pitchStart - 2)) * $noteHeight}
					width={$noteWidth * (dragEndNote > dragStartNote ? dragEndNote - dragStartNote : 0)}
					height={$noteHeight}
					strokeStyle="#eeeeff"
					fillStyle="#eeeeff"
					rounded={$noteHeight / 2}
				></Rectangle>
			{/if}
		</Layer>
		<Layer name="Vertical Cursor Line">
			<Line
				points={[
					{ x: hoverPointX, y: 0 },
					{ x: hoverPointX, y: 8 * $noteHeight * 12 }
				]}
				strokeStyle="black"
			></Line>
		</Layer>
		<Layer name="Piano">
			<!--Piano -->
			{@const offsetY = -($noteHeight * (11 - (pitchEnd % 12)))}
			{@const numOfGroups = Math.floor(pitchEnd / 12) - Math.floor(pitchStart / 12) + 1}
			{#each new Array(numOfGroups * 7) as _, i}
				<Rectangle
					x={0}
					y={i * $pianoHeight + offsetY}
					width={$pianoWidth}
					height={$pianoHeight}
					lineWidth={0.5}
					strokeStyle="black"
					fillStyle="white"
				></Rectangle>
			{/each}
			{#each new Array(numOfGroups * 7) as _, i}
				{#if i % 7 !== 3 && i % 7 !== 6}
					<Rectangle
						x={0}
						y={(i + 0.666) * $pianoHeight + offsetY}
						width={$pianoWidth * 0.5}
						height={$pianoHeight * 0.666}
						strokeStyle="black"
						fillStyle="black"
					></Rectangle>
				{/if}
			{/each}
			<Clip
				x={0}
				y={$noteHeight * (pitchEnd - pitchStart + 1)}
				width={$pianoWidth}
				height={$noteHeight * 2}
			></Clip>
			<Text x={0} y={$noteHeight * (pitchEnd - pitchStart + 3)} textBaseline="bottom" text="mute"
			></Text>
			<Rectangle
				x={-1}
				y={0}
				width={innerWidth}
				height={$noteHeight * (pitchEnd - pitchStart + 1)}
				lineWidth={1}
				strokeStyle="black"
				fillStyle="transparent"
			></Rectangle>
		</Layer>
	</Layer>
	<Layer name="Time Indicator Gridline">
		<!--Per Beat-->
		{#each rangeFloat( $noteFrameStart, $noteFrameStart + (innerWidth - $pianoWidth) / $noteWidth, { gap: 1 / $beatPerBar, quantized: true } ) as i}
			<Line
				points={[
					{ x: $pianoWidth + $noteWidth * (i - $noteFrameStart), y: $timeGridlineHeight - 5 },
					{ x: $pianoWidth + $noteWidth * (i - $noteFrameStart), y: $timeGridlineHeight }
				]}
				strokeStyle="#1c1c1c"
			></Line>
		{/each}
		<!--Per Bar-->
		{#each rangeFloat( $noteFrameStart, $noteFrameStart + (innerWidth - $pianoWidth) / $noteWidth, { gap: 1, quantized: true } ) as i}
			<Text
				x={$pianoWidth + $noteWidth * (i - $noteFrameStart)}
				y={0}
				text={`${i}`}
				textAlign="center"
				textBaseline="top"
			></Text>
			<Line
				points={[
					{
						x: $pianoWidth + $noteWidth * (i - $noteFrameStart),
						y: $timeGridlineHeight - 10
					},
					{
						x: $pianoWidth + $noteWidth * (i - $noteFrameStart),
						y: $timeGridlineHeight
					}
				]}
				lineWidth={3}
			></Line>
		{/each}
	</Layer>
</Canvas>
<svelte:window bind:innerWidth bind:innerHeight />
