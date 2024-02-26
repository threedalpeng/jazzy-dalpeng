<script lang="ts">
	import { type ChordQuality } from '$/utils/music/chords';
	import { stringifyFinaleJazzChordSigns } from '$/utils/music/font';
	import { chordQualityToFinaleJazzChordSignMap } from './chord-map';

	export let quality: ChordQuality | undefined = undefined;
</script>

{#if quality !== undefined && quality !== 'major'}{stringifyFinaleJazzChordSigns([
		chordQualityToFinaleJazzChordSignMap[quality]
	])}{/if}
