<script lang="ts">
	import MetronomeProvider from '$/lib/device/metronome/MetronomeProvider.svelte';
	import RandomBoxProvider from '$/lib/practice/RandomBox/RandomBoxProvider.svelte';
	import type { LayoutData } from './$types';

	export let data: LayoutData;
	$: practice = data.pages.current.practice;
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
