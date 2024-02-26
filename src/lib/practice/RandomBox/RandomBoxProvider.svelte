<script lang="ts" generics="T">
	import { onDestroy } from 'svelte';
	import { RandomBox } from './RandomBox';
	import { setRandomBoxContext } from './context';

	export let items: T[] = [];

	const randomBox = setRandomBoxContext(new RandomBox<T>(items));
	$: randomBox.items = items;

	console.log(randomBox);

	onDestroy(() => {
		randomBox.destroy();
	});
</script>

<slot />
