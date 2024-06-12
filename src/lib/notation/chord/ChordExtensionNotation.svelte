<script lang="ts">
	import { type ChordExtension } from '$/utils/music/chords';
	import { stringifyFinaleJazzChordSigns } from '$/utils/music/font';
	import { chordExtensionToFinaleJazzChordSignMap } from './chord-map';
	interface ChordExtensionNotationProps {
		extension?: ChordExtension | null;
	}
	const { extension }: ChordExtensionNotationProps = $props();
</script>

{#if extension !== undefined && extension !== null}{#if extension === '7, maj7'}{stringifyFinaleJazzChordSigns(
			['7']
		)}<span class="align-super font-jazz">,</span>{stringifyFinaleJazzChordSigns([
			'Major',
			'7'
		])}{:else if extension === 'b6'}<span class="ml-1 align-super"
			>{stringifyFinaleJazzChordSigns(['Flat'])}</span
		>{stringifyFinaleJazzChordSigns(['6'])}{:else}{stringifyFinaleJazzChordSigns(
			chordExtensionToFinaleJazzChordSignMap[extension]
		)}{/if}{/if}
