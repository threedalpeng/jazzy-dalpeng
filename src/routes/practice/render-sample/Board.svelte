<script lang="ts">
	import FingerBoard, { type FingerPosition } from '$lib/guitar/FingerBoard/FingerBoard.svelte';
	import ChordNotation from '$lib/notation/ChordNotation.svelte';
	import type { ChordRoot, ChordName } from '$/utils/music/chords';

	export let root: ChordRoot;
	export let name: ChordName;
	export let fingers: FingerPosition[] | undefined;
	export let isFingerboardHidden = false;
</script>

<div class="leading-1.2em text-80px mb-0.5em block h-fit select-none text-center">
	<ChordNotation {root} {name} />
</div>
{#if !isFingerboardHidden}
	<FingerBoard {fingers} fretRange={{ start: 0, end: 12, visibility: 'all' }} on:click />
{/if}
