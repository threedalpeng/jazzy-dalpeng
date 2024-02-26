<script lang="ts">
	import MetronomeProvider from '$/lib/device/metronome/MetronomeProvider.svelte';
	import RandomBoxProvider from '$/lib/practice/RandomBox/RandomBoxProvider.svelte';
	import { TempoTimer } from '$/lib/timer/tick';
	import type { LayoutData } from './$types';

	export let data: LayoutData;
	$: practice = data.pages.current.practice;
	let timer = new TempoTimer();
	$: {
		timer.bpm = practice.tempo.bpm;
		timer.beatPerBar = practice.tempo.beatPerBar;
		timer.signatureUnit = practice.tempo.signatureUnit;
	}
</script>

<MetronomeProvider {timer}>
	<RandomBoxProvider items={practice.scores}>
		<slot />
	</RandomBoxProvider>
</MetronomeProvider>
