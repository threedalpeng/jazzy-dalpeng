<script lang="ts">
	import { type ChordRoot } from '$/utils/music/chords';
	import { stringifyFinaleJazzChordSigns } from '$/utils/music/font';
	import { chordRootToFinaleJazzChordSignMap } from './chord-map';

	export let root: ChordRoot;
</script>

{stringifyFinaleJazzChordSigns(chordRootToFinaleJazzChordSignMap[root])}
