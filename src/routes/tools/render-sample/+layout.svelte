<script lang="ts" context="module">
	export interface Board {
		title: string;
		fingers: FingerInfo[];
	}
</script>

<script lang="ts">
	import MetronomeProvider from '$/lib/device/metronome/MetronomeProvider.svelte';
	import type { FingerInfo } from '$/lib/guitar/finger-board/FingerBoard.svelte';
	import RandomBoxProvider from '$/lib/practice/RandomBox/RandomBoxProvider.svelte';
	import { practice } from './data';
</script>

<MetronomeProvider
	bpm={practice.tempo.bpm}
	beatPerBar={practice.tempo.beatPerBar}
	signatureUnit={practice.tempo.signatureUnit}
>
	<RandomBoxProvider items={practice.scores}>
		<slot />
	</RandomBoxProvider>
</MetronomeProvider>
