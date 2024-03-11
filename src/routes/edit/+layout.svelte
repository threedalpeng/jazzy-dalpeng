<script lang="ts">
	import MetronomeProvider from '$/lib/device/metronome/MetronomeProvider.svelte';
	import PianoRollProvider from '$/lib/guitar/piano-roll/PianoRollProvider.svelte';
	import { TempoTimer } from '$/lib/timer/tick';

	let timer = new TempoTimer();
</script>

<MetronomeProvider {timer}>
	<PianoRollProvider>
		<slot />
	</PianoRollProvider>
</MetronomeProvider>
