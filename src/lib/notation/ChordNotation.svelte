<script lang="ts">
	import {
		type ChordBass,
		type ChordExtension,
		type ChordQuality,
		type ChordRoot
	} from '$/utils/music/chords';
	import { stringifyFinaleJazzChordSigns } from '$/utils/music/font';
	import ChordExtentionNotation from './chord/ChordExtensionNotation.svelte';
	import ChordQualityNotation from './chord/ChordQualityNotation.svelte';
	import ChordRootNotation from './chord/ChordRootNotation.svelte';
	import ChordTensionNotation from './chord/ChordTensionNotation .svelte';

	interface ChordNotationProps {
		root: ChordRoot;
		quality?: ChordQuality;
		extension?: ChordExtension | null;
		tensions?: number[];
		bass?: ChordBass;
	}

	const { root, quality, extension, tensions = [], bass }: ChordNotationProps = $props();

	const needsToSwitch = $derived(
		(quality === 'sus2' || quality === 'sus4') && extension !== 'b6' && extension !== 'maj7'
	);
</script>

<span class="font-chord"
	><ChordRootNotation {root} />{#if !needsToSwitch}<ChordQualityNotation
			{quality}
		/>{/if}<ChordExtentionNotation {extension} />{#if needsToSwitch}<ChordQualityNotation
			{quality}
		/>{/if}<ChordTensionNotation
		{tensions}
	/>{#if bass !== undefined && bass !== root}{stringifyFinaleJazzChordSigns([
			'/'
		])}<ChordRootNotation root={bass} />{/if}
</span>
