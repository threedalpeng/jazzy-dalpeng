<script lang="ts">
	import { getChordNotations, type ChordRoot } from '$/utils/music/chords';

	export let note: ChordRoot;
	export let octave: number;

	$: chordNotations = getChordNotations(note, 'none');
</script>

<span class="font-chord">{chordNotations.default.short}</span><span class="font-jazz">{octave}</span
>
