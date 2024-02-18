<script lang="ts">
	import { Play, Stop } from '@steeze-ui/heroicons';
	import { Icon } from '@steeze-ui/svelte-icon';
	import { getMetronomeContext } from './context';
	const metronome = getMetronomeContext();
	$: isRunning = metronome.isRunning;
</script>

<button
	{...$$restProps}
	class="{$$props.class} flex aspect-square items-center justify-center rounded-full bg-indigo-900 p-0 focus:outline-none"
	on:click={() => {
		metronome.toggle();
		isRunning = metronome.isRunning;
	}}
>
	{#if isRunning}
		<Icon class="m-0 h-1/2 p-0 text-indigo-100" src={Stop} theme="solid" />
	{:else}
		<Icon class="m-0 h-1/2 p-0 text-indigo-100" src={Play} theme="solid" />
	{/if}
</button>
