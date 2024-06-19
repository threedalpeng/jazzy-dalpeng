<script lang="ts">
	import type { Snippet } from 'svelte';
	import { setPianoRollContext } from './context';

	interface PianoRollProviderProps {
		quantizingUnit?: number;
		children: Snippet;
	}

	let { quantizingUnit, children }: PianoRollProviderProps = $props();
	const _pianoRollContext = setPianoRollContext({
		quantizingUnit
	});
</script>

{@render children()}
