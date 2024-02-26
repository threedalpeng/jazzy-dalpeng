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

	export let root: ChordRoot;
	export let quality: ChordQuality | undefined = undefined;
	export let extension: ChordExtension | undefined | null = undefined;
	export let tensions: number[] = [];
	export let bass: ChordBass | undefined = undefined;

	$: needsToSwitch =
		(quality === 'sus2' || quality === 'sus4') && extension !== 'b6' && extension !== 'maj7';
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
