<script lang="ts">
	import { type ChordQuality } from '$/utils/music/chords';
	import { stringifyFinaleJazzChordSigns } from '$/utils/music/font';
	import { chordQualityToFinaleJazzChordSignMap } from './chord-map';

	interface ChordQualityNotationProps {
		quality?: ChordQuality;
	}
	const { quality }: ChordQualityNotationProps = $props();
</script>

{#if quality !== undefined && quality !== 'major'}{stringifyFinaleJazzChordSigns([
		chordQualityToFinaleJazzChordSignMap[quality]
	])}{/if}
