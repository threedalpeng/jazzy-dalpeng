<script lang="ts">
	import { stringifyFinaleJazzChordSigns } from '$/utils/music/font';
	import { chordTensionToFinaleJazzChordSignMap } from './chord-map';
	export let tensions: number[] = [];
</script>

{#if tensions.length > 0}<span class="align-super mr-4">{stringifyFinaleJazzChordSigns(['('])}</span
	>{#each tensions as tension, idx}{#if idx !== 0}<span class="font-jazz align-super">{','}</span
			>{/if}{@const flat = tension === 13 || tension === 20}{@const sharp =
			tension === 15 || tension === 18}{#if flat}<span class="align-super"
				>{stringifyFinaleJazzChordSigns(['Flat'])}</span
			>{/if}{#if sharp}<span class="align-super">{stringifyFinaleJazzChordSigns(['Sharp'])}</span
			>{/if}{stringifyFinaleJazzChordSigns(
			chordTensionToFinaleJazzChordSignMap[tension]
		)}{/each}<span class="align-super ml-2">{stringifyFinaleJazzChordSigns([')'])}</span>{/if}
