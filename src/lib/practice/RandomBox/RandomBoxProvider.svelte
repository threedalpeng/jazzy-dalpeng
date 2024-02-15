<script lang="ts" generics="T">
	import { onDestroy } from 'svelte';
	import { setRandomBoxContext } from './context';
	import { RandomBox } from './RandomBox';

	export let items: T[] = [];

	const randomBox = setRandomBoxContext(new RandomBox<T>(items));

	onDestroy(() => {
		randomBox.destroy();
	});
</script>

<slot />
