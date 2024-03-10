<script lang="ts">
	import MetronomeBeats from '$/lib/device/metronome/MetronomeBeats.svelte';
	import { getMetronomeContext } from '$/lib/device/metronome/context';
	import MetronomePlayButton from '$lib/device/metronome/MetronomePlayButton.svelte';

	const metronome = getMetronomeContext();


	const timer = metronome.timer;
</script>

<div class="h-full w-screen">
	<div class="relative h-full">
		<div class="absolute right-0 z-10 flex h-[60px] w-screen flex-row items-center justify-between">
			<div class="ml-4 flex h-full flex-row items-start justify-between gap-4">
				<!-- <MetronomeOptions /> -->
			</div>
		</div>
		<div class="relative flex h-screen flex-col items-center justify-center">
			<!-- <PianoRoll {notes} {pitchHighlight} on:select={updateNotes}></PianoRoll>
			<FingerBoard class="max-w-[100vw]" {fingers} on:click={updateFingers}></FingerBoard> -->
			<MetronomeBeats class="p-20" />
			<MetronomePlayButton class="h-20" />
		</div>
	</div>
</div>
