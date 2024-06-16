<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { getMetronomeContext } from './context';

	const metronome = getMetronomeContext();

	interface MetronomeBeatsProps extends HTMLAttributes<HTMLDivElement> {}
	const { ...rest }: MetronomeBeatsProps = $props();

	let beatPerBar = $state(metronome.timer.tempoState.beatPerBar);
	let currentBeat = $state(0);
	metronome.onBeat((state) => {
		currentBeat = state.currentBeat;
	});
	metronome.timer.onTempoChanged((state) => {
		beatPerBar = state.beatPerBar;
	});
</script>

<div
	{...rest}
	class="{rest.class} relative flex w-screen flex-row flex-wrap items-center justify-center gap-[40px]"
>
	{#each new Array(beatPerBar) as _, i}
		{#if i === 0}
			{#if i === currentBeat - 1}
				<div class="h-[30px] w-[30px] rounded-full bg-indigo-500"></div>
			{:else}
				<div class="h-[30px] w-[30px] rounded-full bg-indigo-900"></div>
			{/if}
		{:else if i === currentBeat - 1}
			<div class="h-[20px] w-[20px] rounded-full bg-indigo-500"></div>
		{:else}
			<div class="h-[20px] w-[20px] rounded-full bg-indigo-900"></div>
		{/if}
	{/each}
</div>
