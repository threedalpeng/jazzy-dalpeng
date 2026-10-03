<script lang="ts" module>
	export interface Board {
		title: string;
		fingers: FingerInfo[];
	}
</script>

<script lang="ts">
	import MetronomeProvider from '#src/lib/device/metronome/MetronomeProvider.svelte';
	import type { FingerInfo } from '#src/lib/guitar/finger-board/FingerBoard.svelte';
	import { TempoTimer } from '#src/lib/timer/tick.ts';
	import { onDestroy, type Snippet } from 'svelte';

	interface MetronomeLayoutProps {
		children: Snippet;
	}

	const { children }: MetronomeLayoutProps = $props();

	const timer = new TempoTimer();
	onDestroy(() => timer.destroy());
</script>

<MetronomeProvider {timer}>
	{@render children()}
</MetronomeProvider>
