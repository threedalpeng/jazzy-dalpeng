<script lang="ts" generics="T">
	import { type Snippet } from 'svelte';
	import { RandomBox } from './RandomBox';
	import { setRandomBoxContext } from './context';

	interface RandomBoxProviderProps {
		items?: T[];
		children: Snippet;
	}
	const { items = [], children }: RandomBoxProviderProps = $props();

	const randomBox = setRandomBoxContext(new RandomBox<T>(items));
	$effect.pre(() => {
		randomBox.items = items;

		return () => {
			randomBox.destroy();
		};
	});
</script>

{@render children()}
