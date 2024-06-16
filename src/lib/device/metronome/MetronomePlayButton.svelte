<script lang="ts">
	import { getMetronomeContext } from '$/lib/device/metronome/context';
	import { onDestroy } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import IconPlaySolid from '~icons/heroicons/play-solid';
	import IconStopSolid from '~icons/heroicons/stop-solid';

	interface MetronomePlayButtonProps extends HTMLButtonAttributes {}
	const { ...rest }: MetronomePlayButtonProps = $props();

	const metronome = getMetronomeContext();
	metronome.schedule();

	let isRunning = $state<boolean>(false);
	const cancelStart = metronome.timer.onStart(() => {
		isRunning = true;
	});
	const cancelStop = metronome.timer.onStop(() => {
		isRunning = false;
	});
	onDestroy(() => {
		cancelStart();
		cancelStop();
	});
</script>

<button
	{...rest}
	class="{rest.class} flex aspect-square items-center justify-center rounded-full bg-indigo-900 p-0 focus:outline-none"
	onclick={() => {
		metronome.timer.toggle();
	}}
>
	{#if isRunning}
		<IconStopSolid class="m-0 h-1/2 w-1/2 p-0 text-indigo-100"></IconStopSolid>
	{:else}
		<IconPlaySolid class="m-0 h-1/2 w-1/2 p-0 text-indigo-100"></IconPlaySolid>
	{/if}
</button>
