<script lang="ts">
	import { type ChordRoot } from '#src/utils/music/chords.ts';
	import { stringifyFinaleJazzChordSigns } from '#src/utils/music/font.ts';
	import { chordRootToFinaleJazzChordSignMap } from './chord-map';

	interface ChordRootNotationProps {
		root: ChordRoot;
	}
	const { root }: ChordRootNotationProps = $props();
</script>

{stringifyFinaleJazzChordSigns(chordRootToFinaleJazzChordSignMap[root])}
