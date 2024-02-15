<script lang="ts">
	import PitchNotation from '$/lib/notation/PitchNotation.svelte';
	import { identifyChordsFromPitches } from '$/utils/music/chords';
	import { stringifyFinaleJazzChordSigns } from '$/utils/music/font';
	import {
		getPitchFromNumber,
		getPitchesFromFingerPositions,
		sortPitches
	} from '$/utils/music/pitch';
	import FingerBoard, { type FingerInfo } from '$/lib/guitar/finger-board/FingerBoard.svelte';
	import ChordNotation from '$lib/notation/ChordNotation.svelte';
	export let fingers: FingerInfo[] = [];

	$: pitches = sortPitches(getPitchesFromFingerPositions(fingers.map((finger) => finger.position)));
	$: chords = identifyChordsFromPitches(pitches);
	$: {
		console.log(chords?.bass, chords?.chords[0].symbols);
	}
	export let isFingerboardHidden = false;
</script>

{#if chords != undefined}
	{#each chords.chords as chord}
		<div class="mb-[0.5em] block h-fit select-none text-center text-[80px] leading-[1.2em]">
			<ChordNotation
				root={getPitchFromNumber(chord.symbols.root).note}
				quality={chord.symbols.quality}
				extension={chord.symbols.extension ?? undefined}
				tensions={chord.tones.tensions}
				bass={getPitchFromNumber(chords.bass).note}
			/>
		</div>
	{/each}
{/if}
<p>
	{#each pitches as pitch}
		<PitchNotation note={pitch.note} octave={pitch.octave}></PitchNotation>
	{/each}
	<span class="font-chord">
		{stringifyFinaleJazzChordSigns(['MinorSixth'])}
		{String.fromCodePoint(225 + 29)}
	</span>
</p>
{#if !isFingerboardHidden}
	<FingerBoard {fingers} fretRange={{ start: 0, end: 12, visibility: 'all' }} on:click />
{/if}
