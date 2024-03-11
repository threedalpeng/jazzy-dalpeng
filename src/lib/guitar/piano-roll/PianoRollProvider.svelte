<script lang="ts">
	import { setPianoRollContext } from './context';

	export let quantizingUnit: number | undefined = undefined;
	const pianoRollContext = setPianoRollContext({
		quantizingUnit
	});
</script>

<slot />
