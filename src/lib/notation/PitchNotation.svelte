<script lang="ts">
	import { type ChordRoot } from '$/utils/music/chords';
	import { stringifyFinaleJazzChordSigns } from '$/utils/music/font';
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
