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
	import { range } from '$/utils/basic';
	import { createEventDispatcher } from 'svelte';
	import Timeline from './Timeline.svelte';
	import { setPianoRollContext } from './context';

	let innerWidth = window.innerWidth;
	let innerHeight = window.innerHeight;

	const dispatch = createEventDispatcher<{ select: PianoRollNote }>();

	export let pitchStart: number = 40;
	export let pitchEnd: number = 84;
	export let pitchHighlight: number | 'mute' | null = null;
	$: pitchRange = range(pitchStart, pitchEnd + 1);

	export let notes: PianoRollNote[] = [];

	const {
		noteFrameStart,
		noteWidth,
		noteHeight,
		pianoWidth,
		pianoHeight,
		beatPerBar,
		quantizingUnit
	} = setPianoRollContext();

	let hoverPointNote = 0;
	$: hoverPointX = hoverPointNote * $noteWidth + $pianoWidth;
	$noteWidth = innerWidth / 5;
	$quantizingUnit = 1 / 24;

	let isDragging = false;
	let dragButton: number = 0;
	let cursorPitch: number | 'mute' = 0;
	$: selectedPitch = pitchHighlight ?? cursorPitch;
	let dragStartNote = 0;
	let dragEndNote = 0;
</script>

<Canvas
	width={innerWidth}
	height={$noteHeight * (pitchEnd - pitchStart + 3)}
	on:pointermove={(e) => {
		const note = (e.offsetX - $pianoWidth) / $noteWidth;
		hoverPointNote = Math.round(note / $quantizingUnit) * $quantizingUnit;
		hoverPointNote = hoverPointNote < 0 ? 0 : hoverPointNote;
		if (isDragging && dragButton === 0) {
			dragEndNote = hoverPointNote;
		}

		if (isDragging && dragButton === 2) {
			$noteFrameStart = $noteFrameStart + e.movementX / $noteWidth;
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
	}}
	on:wheel={(e) => {
		const newNoteWidth = $noteWidth + e.deltaY * -0.04;
		$noteWidth = newNoteWidth > 16 ? newNoteWidth : 16;
		console.log($noteWidth);
	}}
>
	<Layer>
		{#each pitchRange as i}
			<Rectangle
				x={0}
				y={(pitchEnd - i + 1) * $pianoHeight}
				width={$pianoWidth}
				height={$pianoHeight}
				lineWidth={0.5}
				strokeStyle="black"
				fillStyle="white"
			></Rectangle>
		{/each}
		{#each pitchRange as i}
			{#if i % 7 !== 1 && i % 7 !== 4}
				<Rectangle
					x={0}
					y={(pitchEnd - i + 0.666 + 1) * $pianoHeight}
					width={$pianoWidth * 0.5}
					height={$pianoHeight * 0.666}
					strokeStyle="black"
					fillStyle="black"
				></Rectangle>
			{/if}
		{/each}
		<Timeline
			{pitchStart}
			{pitchEnd}
			{pitchHighlight}
			on:over={(ev) => {
				if (!isDragging) cursorPitch = ev.detail.cursorPitch;
			}}
		/>
	</Layer>
	<Layer>
		{#each notes as note}
			{#if note.pitch !== 'mute'}
				<Rectangle
					x={$pianoWidth + $noteWidth * note.time.start}
					y={(pitchEnd - note.pitch) * $noteHeight}
					width={$noteWidth * note.time.duration}
					height={$noteHeight}
					strokeStyle="#111111"
					fillStyle="#ffffff"
					rounded={$noteHeight / 2}
				></Rectangle>{/if}
		{/each}
		{#if isDragging}
			<Rectangle
				x={$pianoWidth + $noteWidth * dragStartNote}
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
</Canvas>
<svelte:window bind:innerWidth bind:innerHeight />
