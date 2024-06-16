<script lang="ts" generics="T">
	import type { ShuffleMode } from './RandomBox';
	import { getRandomBoxContext } from './context';

	interface RandomBoxOptionsProps {
		shuffleMode?: ShuffleMode;
	}

	let { shuffleMode = $bindable('all-done') }: RandomBoxOptionsProps = $props();

	const randomBox = getRandomBoxContext<T>();
	$effect(() => {
		randomBox.shuffleMode = shuffleMode;
	});
</script>

<div class="flex h-full flex-col items-start justify-between">
	<label for="shuffle-mode" class="text-sm">Shuffle Mode</label>
	<select id="shuffle-mode" class="select" bind:value={shuffleMode}>
		<option value="each-turn">Each Turn</option>
		<option value="all-done">All Done</option>
	</select>
</div>
