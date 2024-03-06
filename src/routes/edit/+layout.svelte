<script lang="ts">
	import MetronomeProvider from '$/lib/device/metronome/MetronomeProvider.svelte';
	import { TempoTimer } from '$/lib/timer/tick';

	let timer = new TempoTimer();
</script>

<MetronomeProvider {timer}>
	<slot />
</MetronomeProvider>
