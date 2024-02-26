<script lang="ts">
	import MetronomeBeats from '$/lib/device/metronome/MetronomeBeats.svelte';
	import MetronomeOptions from '$/lib/device/metronome/MetronomeOptions.svelte';
	import { getMetronomeContext } from '$/lib/device/metronome/context';
	import { Play, Stop } from '@steeze-ui/heroicons';
	import { Icon } from '@steeze-ui/svelte-icon';
	import { onDestroy } from 'svelte';

	const metronome = getMetronomeContext();
	metronome.schedule();

	let isRunning = false;
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

<div class="h-full w-screen">
	<div class="relative h-full">
		<div class="absolute right-0 z-10 flex h-[60px] w-screen flex-row items-center justify-between">
			<div class="ml-4 flex h-full flex-row items-start justify-between gap-4">
				<MetronomeOptions />
			</div>
			<button
				class="mr-8 flex aspect-square h-3/4 items-center justify-center rounded-full bg-indigo-900 p-0 focus:outline-none"
				on:click={() => {
					metronome.timer.toggle();
				}}
			>
				{#if isRunning}
					<Icon class="m-0 h-[20px] w-[20px] p-0 text-indigo-100" src={Stop} theme="solid" />
				{:else}
					<Icon class="m-0 h-[20px] w-[20px] p-0 text-indigo-100" src={Play} theme="solid" />
				{/if}
			</button>
		</div>
		<div class="relative flex h-full flex-col items-center justify-center">
			<MetronomeBeats />
		</div>
	</div>
</div>
