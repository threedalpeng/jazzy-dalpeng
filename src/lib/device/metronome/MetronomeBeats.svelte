<script lang="ts">
	import { onMount } from 'svelte';
	import { getMetronomeContext } from './context';

	const metronome = getMetronomeContext();

	let beatPerBar = 4,
		currentBeat = 1;
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

<div
	{...$$restProps}
	class="{$$props.class} relative flex w-screen flex-row items-center justify-center gap-[40px]"
>
	{#each new Array(beatPerBar) as _, i}
		{#if i === 0}
			{#if i === currentBeat - 1}
				<div class="h-[30px] w-[30px] rounded-full bg-indigo-500" />
			{:else}
				<div class="h-[30px] w-[30px] rounded-full bg-indigo-900" />
			{/if}
		{:else if i === currentBeat - 1}
			<div class="h-[20px] w-[20px] rounded-full bg-indigo-500" />
		{:else}
			<div class="h-[20px] w-[20px] rounded-full bg-indigo-900" />
		{/if}
	{/each}
</div>
