<script lang="ts">
	import { getMetronomeContext } from '$/lib/device/metronome/context';
	import { Play, Stop } from '@steeze-ui/heroicons';
	import { Icon } from '@steeze-ui/svelte-icon';
	import { onDestroy } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

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
		<Icon class="m-0 h-1/2 p-0 text-indigo-100" src={Stop} theme="solid" />
	{:else}
		<Icon class="m-0 h-1/2 p-0 text-indigo-100" src={Play} theme="solid" />
	{/if}
</button>
