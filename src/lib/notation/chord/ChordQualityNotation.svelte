<script lang="ts">
	import { type ChordQuality } from '#src/utils/music/chords.ts';
	import { stringifyFinaleJazzChordSigns } from '#src/utils/music/font.ts';
	import { chordQualityToFinaleJazzChordSignMap } from './chord-map';

	interface ChordQualityNotationProps {
		quality?: ChordQuality;
	}
	const { quality }: ChordQualityNotationProps = $props();
</script>

{#if quality !== undefined && quality !== 'major'}{stringifyFinaleJazzChordSigns([
		chordQualityToFinaleJazzChordSignMap[quality]
	])}{/if}
