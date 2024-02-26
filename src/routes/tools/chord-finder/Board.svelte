<script lang="ts">
	import FingerBoard, { type FingerInfo } from '$/lib/guitar/finger-board/FingerBoard.svelte';
	import { identifyChordsFromPitches } from '$/utils/music/chords';
	import {
		getPitchFromNumber,
		getPitchesFromFingerPositions,
		sortPitches
	} from '$/utils/music/pitch';
	import ChordNotation from '$lib/notation/ChordNotation.svelte';
	export let fingers: FingerInfo[] = [];

	$: pitches = sortPitches(getPitchesFromFingerPositions(fingers.map((finger) => finger.position)));
	$: chords = identifyChordsFromPitches(pitches);
</script>

<div class="relative flex h-full flex-col items-center justify-center">
	{#if chords != undefined}
		{@const primaryChord = chords.chords.at(0)}
		<div class="flex flex-col items-center gap-8 lg:flex-row lg:gap-28">
			{#if primaryChord}
				<div class="inline-block h-fit select-none text-center text-[80px] leading-[1.2em]">
					<ChordNotation
						root={getPitchFromNumber(primaryChord.symbols.root).note}
						quality={primaryChord.symbols.quality}
						extension={primaryChord.symbols.extension}
						tensions={primaryChord.tones.tensions}
						bass={getPitchFromNumber(chords.bass).note}
					/>
				</div>
			{/if}
			<div class="flex flex-col">
				{#each chords.chords.slice(1) as chord, idx}
					{#if idx === 0}
						<div class="inline-block h-fit select-none text-center text-[60px] leading-[1.2em]">
							<ChordNotation
								root={getPitchFromNumber(chord.symbols.root).note}
								quality={chord.symbols.quality}
								extension={chord.symbols.extension}
								tensions={chord.tones.tensions}
								bass={getPitchFromNumber(chords.bass).note}
							/>
						</div>
					{:else}
						<div class="block h-fit select-none text-center text-[40px] leading-[1.2em]">
							<ChordNotation
								root={getPitchFromNumber(chord.symbols.root).note}
								quality={chord.symbols.quality}
								extension={chord.symbols.extension}
								tensions={chord.tones.tensions}
								bass={getPitchFromNumber(chords.bass).note}
							/>
						</div>
					{/if}
				{/each}
			</div>
		</div>
	{/if}
</div>
<!-- <p>
	{#each pitches as pitch}
		<PitchNotation note={pitch.note} octave={pitch.octave}></PitchNotation>
	{/each}
</p> -->
<FingerBoard
	class="mb-28 w-screen lg:w-[calc(100vw-14rem)]"
	{fingers}
	fretRange={{ start: 0, end: 12, visibility: 'all' }}
	on:click
/>
