<script lang="ts">
	import { onDestroy } from 'svelte';
	import { setMetronomeContext } from './context';

	export let beatPerBar = 4;
	export let bpm = 120;

	const metronome = setMetronomeContext({ beatPerBar, bpm });

	onDestroy(() => {
		metronome.destroy();
	});
</script>

<slot />
