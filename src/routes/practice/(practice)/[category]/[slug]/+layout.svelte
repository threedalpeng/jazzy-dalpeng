<script lang="ts">
	import MetronomeProvider from '$/lib/device/metronome/MetronomeProvider.svelte';
	import RandomBoxProvider from '$/lib/practice/RandomBox/RandomBoxProvider.svelte';
	import { TempoTimer } from '$/lib/timer/tick';
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';

	interface PracticeSlugLayoutProps {
		data: LayoutData;
		children: Snippet;
	}
	const { data, children }: PracticeSlugLayoutProps = $props();

	const practice = $derived(data.pages.current.practice);
	let timer = new TempoTimer();

	$effect(() => {
		timer.bpm = practice.tempo.bpm;
		timer.beatPerBar = practice.tempo.beatPerBar;
		timer.signatureUnit = practice.tempo.signatureUnit;
	});
</script>

<MetronomeProvider {timer}>
	<RandomBoxProvider items={practice.scores}>
		{@render children()}
	</RandomBoxProvider>
</MetronomeProvider>
