<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { getMetronomeContext } from './context.svelte';

	const context = getMetronomeContext();

	type MetronomeBeatsProps = HTMLAttributes<HTMLDivElement>;
	const { ...rest }: MetronomeBeatsProps = $props();

	let currentBeat = $state(0);
	context.metronome.onBeat((state) => {
		currentBeat = state.currentBeat;
	});
</script>

<div
	{...rest}
	class="{rest.class} relative flex w-screen flex-row flex-wrap items-center justify-center gap-[40px]"
>
	{#each new Array(context.beatPerBar) as _, i}
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
