<script lang="ts">
	import { stringifyFinaleJazzChordSigns } from '$/utils/music/font';
	import { chordTensionToFinaleJazzChordSignMap } from './chord-map';
	export let tensions: number[] = [];
</script>

{#if tensions.length > 0}{#if tensions.length === 1}<span class="align-[0.20em]">add</span
		>{:else}<span class="mr-4 align-super">{stringifyFinaleJazzChordSigns(['('])}</span
		>{/if}{#each tensions as tension, idx}{#if idx !== 0}<span class="mr-1 align-[0.20em] font-jazz"
				>{','}</span
			>{/if}{@const flat = tension === 13 || tension === 20}{@const sharp =
			tension === 15 || tension === 18}{#if flat}<span class="align-super"
				>{stringifyFinaleJazzChordSigns(['Flat'])}</span
			>{/if}{#if sharp}<span class="align-super">{stringifyFinaleJazzChordSigns(['Sharp'])}</span
			>{/if}{stringifyFinaleJazzChordSigns(
			chordTensionToFinaleJazzChordSignMap[tension]
		)}{/each}{#if tensions.length > 1}<span class="ml-2 align-super"
			>{stringifyFinaleJazzChordSigns([')'])}</span
		>{/if}{/if}
