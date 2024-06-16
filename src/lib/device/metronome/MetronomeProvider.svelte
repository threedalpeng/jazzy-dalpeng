<script lang="ts">
	import { TempoTimer } from '$/lib/timer/tick';
	import { onDestroy, type Snippet } from 'svelte';
	import { setMetronomeContext } from './context';

	interface MetronomeProviderProps {
		timer?: TempoTimer;
		children: Snippet;
	}

	const { timer, children }: MetronomeProviderProps = $props();

	const metronome = setMetronomeContext(timer);

	onDestroy(() => {
		metronome.destroy();
	});
</script>

{@render children()}
