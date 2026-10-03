<script lang="ts">
	import MetronomeProvider from '#src/lib/device/metronome/MetronomeProvider.svelte';
	import RandomBoxProvider from '#src/lib/practice/RandomBox/RandomBoxProvider.svelte';
	import { TempoTimer } from '#src/lib/timer/tick.ts';
	import { onDestroy, type Snippet } from 'svelte';
	import type { LayoutData } from './$types';

	interface PracticeSlugLayoutProps {
		data: LayoutData;
		children: Snippet;
	}
	const { data, children }: PracticeSlugLayoutProps = $props();

	const practice = $derived(data.pages.current.practice);
	const timer = new TempoTimer();
	onDestroy(() => timer.destroy());

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
