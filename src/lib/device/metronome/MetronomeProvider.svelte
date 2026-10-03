<script lang="ts">
	import { TempoTimer } from '#src/lib/timer/tick.ts';
	import { onDestroy, untrack, type Snippet } from 'svelte';
	import { setMetronomeContext } from './context';

	interface MetronomeProviderProps {
		timer?: TempoTimer;
		children: Snippet;
	}

	const { timer, children }: MetronomeProviderProps = $props();

	const metronome = setMetronomeContext(untrack(() => timer));

	onDestroy(() => {
		metronome.destroy();
	});
</script>

{@render children()}
