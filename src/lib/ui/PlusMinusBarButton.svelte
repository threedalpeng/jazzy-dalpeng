<script lang="ts">
	import { MinusSmall, PlusSmall } from '@steeze-ui/heroicons';
	import { Icon } from '@steeze-ui/svelte-icon';
	import type { HTMLAttributes, HTMLCanvasAttributes } from 'svelte/elements';

	interface PlusMinusBarButtonProps {
		value: number;
		step?: number;
		max?: number | null;
		min?: number | null;
	}

	let {
		value = $bindable(),
		step = 1,
		max = null,
		min = null,
		...rest
	}: HTMLAttributes<HTMLDivElement> & PlusMinusBarButtonProps = $props();
</script>

<div {...rest} class="{rest.class} join join-vertical">
	<button
		class="btn join-item h-4 min-h-4 w-4 min-w-4 p-0"
		onclick={() => {
			value += step;
			if (max !== null) value = value > max ? max : value;
		}}
	>
		<Icon src={PlusSmall}></Icon>
	</button>
	<button
		class="btn join-item h-4 min-h-4 w-4 min-w-4 p-0"
		onclick={() => {
			value -= step;
			if (min !== null) value = value < min ? min : value;
		}}
	>
		<Icon src={MinusSmall}></Icon>
	</button>
</div>
