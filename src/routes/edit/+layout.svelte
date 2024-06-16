<script lang="ts">
	import MetronomeProvider from '$/lib/device/metronome/MetronomeProvider.svelte';
	import PianoRollProvider from '$/lib/guitar/piano-roll/PianoRollProvider.svelte';
	import { TempoTimer } from '$/lib/timer/tick';
	import type { Snippet } from 'svelte';

	interface EditLayoutProps {
		children: Snippet;
	}
	const { children }: EditLayoutProps = $props();

	let timer = new TempoTimer();
</script>

<MetronomeProvider {timer}>
	<PianoRollProvider>
		{@render children()}
	</PianoRollProvider>
</MetronomeProvider>
