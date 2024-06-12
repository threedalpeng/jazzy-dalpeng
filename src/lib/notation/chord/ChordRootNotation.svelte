<script lang="ts">
	import { type ChordRoot } from '$/utils/music/chords';
	import { stringifyFinaleJazzChordSigns } from '$/utils/music/font';
	import { chordRootToFinaleJazzChordSignMap } from './chord-map';

	interface ChordRootNotationProps {
		root: ChordRoot;
	}
	const { root }: ChordRootNotationProps = $props();
</script>

{stringifyFinaleJazzChordSigns(chordRootToFinaleJazzChordSignMap[root])}
