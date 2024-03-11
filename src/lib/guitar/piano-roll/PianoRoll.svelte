<script lang="ts" context="module">
	export interface PianoRollNote {
		time: NoteTimestamp;
		pitch: number | 'mute';
	}
</script>

<script lang="ts">
	import { Line } from '$/lib/canvas';
	import Canvas from '$/lib/canvas/Canvas.svelte';
	import Layer from '$/lib/canvas/elements/Layer.svelte';
	import Rectangle from '$/lib/canvas/elements/Rectangle.svelte';
	import type { NoteTimestamp } from '$/lib/practice/types';
	import { rangeFloat, rangeInt } from '$/utils/basic';
	import { createEventDispatcher } from 'svelte';
	import Timeline from './Timeline.svelte';
	import { getPianoRollContext, setPianoRollContext } from './context';
	import Text from '$/lib/canvas/elements/Text.svelte';
	import Clip from '$/lib/canvas/elements/Clip.svelte';

	let innerWidth = window.innerWidth;
	let innerHeight = window.innerHeight;

	const dispatch = createEventDispatcher<{ select: PianoRollNote }>();

	export let pitchStart: number = 40;
	export let pitchEnd: number = 84;
	export let pitchHighlight: number | 'mute' | null = null;
	$: pitchRange = rangeInt(pitchStart, pitchEnd + 1);

	export let notes: PianoRollNote[] = [];

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

	let hoverPointNote = 0;
	$: hoverPointX = (hoverPointNote - $noteFrameStart) * $noteWidth + $pianoWidth;
	$noteWidth = innerWidth / 5;
	$quantizingUnit = 1 / 24;

	let isDragging = false;
	let dragButton: number = 0;
	let cursorPitch: number | 'mute' = 0;
	$: selectedPitch = pitchHighlight ?? cursorPitch;
	let dragStartNote = 0;
	let dragEndNote = 0;

	function updateNoteFrameStart(deltaX: number) {
		const newNoteFrameStart = $noteFrameStart + deltaX * 0.05;
		$noteFrameStart = newNoteFrameStart > 0 ? newNoteFrameStart : 0;
	}

	$: isScrollingOnX = isDragging && dragButton === 2;
	$: isSelecting = isDragging && dragButton === 0;
</script>

<Canvas
	width={innerWidth}
	height={$noteHeight * (pitchEnd - pitchStart + 3) + $timeGridlineHeight}
	on:pointermove={(e) => {
		const note = (e.offsetX - $pianoWidth) / $noteWidth + $noteFrameStart;
		hoverPointNote = Math.max(Math.round(note / $quantizingUnit) * $quantizingUnit, 0);
		if (isSelecting) {
			dragEndNote = hoverPointNote;
		}

		if (isScrollingOnX) {
			$noteFrameStart = Math.max($noteFrameStart - e.movementX / $noteWidth, 0);
		}
	}}
	on:pointerdown={(e) => {
		isDragging = true;
		dragButton = e.button;
		if (dragButton === 0) {
			dragStartNote = hoverPointNote;
		}
	}}
	on:pointerup={(e) => {
		isDragging = false;
		if (dragButton === 0) {
			if (dragEndNote > dragStartNote) {
				dispatch('select', {
					time: { start: dragStartNote, duration: dragEndNote - dragStartNote },
					pitch: selectedPitch
				});
			}
			notes = notes;
		}
		dragStartNote = 0;
		dragEndNote = 0;
	}}
	on:wheel={(e) => {
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
			on:over={(ev) => {
				if (!isDragging) cursorPitch = ev.detail.cursorPitch;
			}}
		/>
		<Layer>
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
						on:click={() => {
							console.log(note);
						}}
					></Rectangle>{/if}
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
		<Layer>
			<Line
				points={[
					{ x: hoverPointX, y: 0 },
					{ x: hoverPointX, y: 8 * $noteHeight * 12 }
				]}
				strokeStyle="black"
			></Line>
		</Layer>
		<Layer>
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
	<Layer>
		<!--Gridline-->
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
