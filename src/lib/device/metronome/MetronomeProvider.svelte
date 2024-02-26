<script lang="ts">
	import { TempoTimer } from '$/lib/timer/tick';
	import { onDestroy } from 'svelte';
	import { setMetronomeContext } from './context';

	export let timer: TempoTimer | undefined;

	const metronome = setMetronomeContext(timer);

	onDestroy(() => {
		metronome.destroy();
	});
</script>

<slot />
