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
	import type { Snippet } from 'svelte';

	interface MetronomeLayoutProps {
		children: Snippet;
	}

	const { children }: MetronomeLayoutProps = $props();

	const timer = new TempoTimer();
</script>

<MetronomeProvider {timer}>
	{@render children()}
</MetronomeProvider>
