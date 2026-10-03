<script lang="ts">
	import { type ChordRoot } from '#src/utils/music/chords.ts';
	import { stringifyFinaleJazzChordSigns } from '#src/utils/music/font.ts';
	import { chordRootToFinaleJazzChordSignMap } from './chord/chord-map';

	interface PitchNotationProps {
		note: ChordRoot;
		octave: number;
	}
	const { note, octave }: PitchNotationProps = $props();

	const chordNotation = $derived(
		stringifyFinaleJazzChordSigns(chordRootToFinaleJazzChordSignMap[note])
	);
</script>

<span class="font-chord">{chordNotation}</span><span class="font-jazz">{octave}</span>
