<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { onDestroy } from 'svelte';
	import { Canvas, Circle } from '#lib/canvas/index.ts';
	import { getMetronomeContext } from './context';
	import type { MetronomeState } from './metronome';
	import type { TempoState } from '../../timer/tick';

	const metronome = getMetronomeContext();
	const { ...rest }: HTMLAttributes<HTMLDivElement> = $props();
	let beatPerBar = $state(metronome.timer.beatPerBar);
	let currentBeat = $state(0);
	const onBeat = (state: MetronomeState) => {
		currentBeat = state.currentBeat;
	};
	const onTempo = (state: TempoState) => {
		beatPerBar = state.beatPerBar;
	};
	metronome.onBeat(onBeat);
	metronome.timer.onTempoChanged(onTempo);
	onDestroy(() => {
		metronome.removeBeat(onBeat);
		metronome.timer.removeTempoChanged(onTempo);
	});
</script>

<div {...rest} class="{rest.class} flex w-screen items-center justify-center">
	<Canvas
		width={Math.max(1, beatPerBar) * 70}
		height={34}
		class="max-w-full"
		role="img"
		aria-label={`Beat ${currentBeat} of ${beatPerBar}`}
	>
		{#each Array(beatPerBar) as _, i (i)}
			<Circle
				x={35 + i * 70}
				y={17}
				radius={i === 0 ? 15 : 10}
				fillStyle={i === currentBeat - 1 ? '#6366f1' : '#312e81'}
				strokeStyle={i === currentBeat - 1 ? '#6366f1' : '#312e81'}
			/>
		{/each}
	</Canvas>
</div>
