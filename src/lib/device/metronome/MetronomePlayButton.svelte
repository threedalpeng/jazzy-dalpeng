<script lang="ts">
	import { getMetronomeContext } from '#src/lib/device/metronome/context.ts';
	import { onDestroy } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import IconPlaySolid from '~icons/heroicons/play-solid';
	import IconStopSolid from '~icons/heroicons/stop-solid';

	interface MetronomePlayButtonProps extends HTMLButtonAttributes {}
	const { ...rest }: MetronomePlayButtonProps = $props();

	const metronome = getMetronomeContext();
	metronome.schedule();

	let isRunning = $state<boolean>(false);
	let audioError = $state('');
	let isStarting = $state(false);
	let request = 0;
	async function toggle() {
		audioError = '';
		const version = ++request;
		if (isStarting || metronome.timer.isRunning) {
			isStarting = false;
			metronome.timer.stop();
		} else {
			isStarting = true;
			try {
				await metronome.timer.start();
			} catch {
				if (version === request) audioError = '소리를 시작하지 못했어요. 다시 재생해 주세요.';
			} finally {
				if (version === request) isStarting = false;
			}
		}
	}
	const cancelError = metronome.timer.onError(() => {
		audioError = '소리를 시작하지 못했어요. 다시 재생해 주세요.';
	});
	const cancelStart = metronome.timer.onStart(() => {
		isRunning = true;
	});
	const cancelStop = metronome.timer.onStop(() => {
		isRunning = false;
		isStarting = false;
	});
	onDestroy(() => {
		cancelError();
		cancelStart();
		cancelStop();
	});
</script>

<button
	{...rest}
	aria-label={isRunning || isStarting ? 'Stop metronome' : 'Start metronome'}
	class="{rest.class} flex aspect-square items-center justify-center rounded-full bg-indigo-900 p-0 focus:outline-none"
	onclick={toggle}
>
	{#if isRunning || isStarting}
		<IconStopSolid class="m-0 h-1/2 w-1/2 p-0 text-indigo-100"></IconStopSolid>
	{:else}
		<IconPlaySolid class="m-0 h-1/2 w-1/2 p-0 text-indigo-100"></IconPlaySolid>
	{/if}
</button>

{#if audioError}<span role="status" class="text-sm">{audioError}</span>{/if}
