<script lang="ts">
	import { type ChordExtension } from '$/utils/music/chords';
	import { stringifyFinaleJazzChordSigns } from '$/utils/music/font';
	import { chordExtensionToFinaleJazzChordSignMap } from './chord-map';
	export let extension: ChordExtension | undefined | null = undefined;
</script>

{#if extension !== undefined && extension !== null}{#if extension === '7, maj7'}{stringifyFinaleJazzChordSigns(
			['7']
		)}<span class="font-jazz align-super">,</span>{stringifyFinaleJazzChordSigns([
			'Major',
			'7'
		])}{:else if extension === 'b6'}<span class="align-super ml-1"
			>{stringifyFinaleJazzChordSigns(['Flat'])}</span
		>{stringifyFinaleJazzChordSigns(['6'])}{:else}{stringifyFinaleJazzChordSigns(
			chordExtensionToFinaleJazzChordSignMap[extension]
		)}{/if}{/if}
