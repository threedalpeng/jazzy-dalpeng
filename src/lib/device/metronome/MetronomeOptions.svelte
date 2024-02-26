<script lang="ts">
	import PlusMinusBarButton from '$/lib/ui/PlusMinusBarButton.svelte';
	import { getMetronomeContext } from './context';

	const metronome = getMetronomeContext();
	export let bpm = metronome.timer.bpm;
	export let beatPerBar = metronome.timer.beatPerBar;

	metronome.timer.onTempoChanged((state) => {
		bpm = state.bpm;
		beatPerBar = state.beatPerBar;
	});

	let lastTapTimestamp = -1;
	let tapIntervalStore: number[] = [];

	$: metronome.timer.bpm = bpm;
	$: metronome.timer.beatPerBar = beatPerBar;
</script>

<div class="flex h-full flex-col items-start justify-between">
	<label for="shuffle-bpm" class="text-sm">BPM</label>
	<div class="flex h-full flex-row items-center justify-start gap-4">
		<div class="group relative flex flex-row items-center">
			<input
				id="shuffle-bpm"
				class="input pr-6"
				type="number"
				min="20"
				max="500"
				bind:value={bpm}
			/>
			<PlusMinusBarButton
				class="absolute right-0 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100"
				bind:value={bpm}
				step={5}
				max={500}
				min={20}
			/>
		</div>
		<div class="tooltip tooltip-right min-h-0" data-tip="Only last 5 taps will be calculated">
			<button
				class="btn btn-square btn-primary aspect-square h-10 min-h-0 p-0"
				on:click={(e) => {
					if (lastTapTimestamp !== -1) {
						tapIntervalStore.push(e.timeStamp - lastTapTimestamp);
					}
					if (tapIntervalStore.length > 4) {
						tapIntervalStore.shift();
					}
					lastTapTimestamp = e.timeStamp;
					if (tapIntervalStore.length > 2) {
						const averageInterval =
							tapIntervalStore.reduce((p, c) => p + c, 0) / tapIntervalStore.length;
						const resultBpm = Math.round(60000 / averageInterval);
						if (20 <= resultBpm && resultBpm <= 500) {
							bpm = resultBpm;
						}
					}
				}}>Tap</button
			>
		</div>
	</div>
</div>
<div class="flex h-full flex-col items-start justify-between">
	<label for="shuffle-beat-per-bar" class="text-sm">Beat</label>
	<div class="group relative flex flex-row items-center">
		<input
			id="shuffle-beat-per-bar"
			class="input pr-6"
			type="number"
			min="1"
			max="12"
			bind:value={beatPerBar}
		/>
		<PlusMinusBarButton
			class="absolute right-0 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100"
			bind:value={beatPerBar}
			max={12}
			min={1}
		/>
	</div>
</div>
