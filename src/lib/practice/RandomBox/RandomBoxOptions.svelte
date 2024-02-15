<script lang="ts" generics="T">
	import type { ShuffleMode } from './RandomBox';
	import { getRandomBoxContext } from './context';

	export let shuffleMode: ShuffleMode = 'all-done';

	const randomBox = getRandomBoxContext<T>();
	$: randomBox.shuffleMode = shuffleMode;
</script>

<div class="flex h-full flex-col items-start justify-between">
	<label for="shuffle-mode" class="text-sm">Shuffle Mode</label>
	<select id="shuffle-mode" class="select" bind:value={shuffleMode}>
		<option value="each-turn">Each Turn</option>
		<option value="all-done">All Done</option>
	</select>
</div>
