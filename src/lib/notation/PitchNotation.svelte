<script lang="ts">
	import { type ChordRoot } from '$/utils/music/chords';
	import { stringifyFinaleJazzChordSigns } from '$/utils/music/font';
	import { chordRootToFinaleJazzChordSignMap } from './chord/chord-map';

	export let note: ChordRoot;
	export let octave: number;

	$: chordNotation = stringifyFinaleJazzChordSigns(chordRootToFinaleJazzChordSignMap[note]);
</script>

<span class="font-chord">{chordNotation}</span><span class="font-jazz">{octave}</span>
