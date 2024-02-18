<script lang="ts">
	import { onDestroy } from 'svelte';
	import { setMetronomeContext } from './context';

	export let beatPerBar = 4;
	export let signatureUnit = 4;
	export let bpm = 120;

	const metronome = setMetronomeContext({ beatPerBar, bpm, signatureUnit });

	onDestroy(() => {
		metronome.destroy();
	});
</script>

<slot />
