<script lang="ts" context="module">
	export interface Board {
		title: string;
		fingers: FingerInfo[];
	}
</script>

<script lang="ts">
	import MetronomeProvider from '$/lib/device/metronome/MetronomeProvider.svelte';
	import type { FingerInfo } from '$/lib/guitar/finger-board/FingerBoard.svelte';
	import { TempoTimer } from '$/lib/timer/tick';

	const timer = new TempoTimer();
	timer.bpm = 127;
</script>

<MetronomeProvider {timer}>
	<slot />
</MetronomeProvider>
