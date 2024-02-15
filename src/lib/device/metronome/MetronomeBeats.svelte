<script lang="ts">
	import { getMetronomeContext } from './context';
	import { onMount } from 'svelte';

	const metronome = getMetronomeContext();

	let beatPerBar = 4,
		currentBeat = 0;
	onMount(() => {
		beatPerBar = metronome.state.beatPerBar;
		currentBeat = metronome.state.currentBeat;
		metronome.onBeat((state) => {
			currentBeat = state.currentBeat;
		});
		metronome.onOptionChange((state) => {
			beatPerBar = state.beatPerBar;
		});
	});
</script>

<div class="relative top-[60px] flex w-screen flex-row items-center justify-center gap-[40px]">
	{#each new Array(beatPerBar) as _, i}
		{#if i === 0}
			{#if i === currentBeat}
				<div class="h-[30px] w-[30px] rounded-full bg-indigo-500" />
			{:else}
				<div class="h-[30px] w-[30px] rounded-full bg-indigo-900" />
			{/if}
		{:else if i === currentBeat}
			<div class="h-[20px] w-[20px] rounded-full bg-indigo-500" />
		{:else}
			<div class="h-[20px] w-[20px] rounded-full bg-indigo-900" />
		{/if}
	{/each}
</div>
