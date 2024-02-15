<script lang="ts">
	import { MinusSmall, PlusSmall } from '@steeze-ui/heroicons';
	import { Icon } from '@steeze-ui/svelte-icon';

	export let value: number;
	export let step: number = 1;
	export let max: number | null = null;
	export let min: number | null = null;
</script>

<div {...$$restProps} class="{$$props.class} join join-vertical">
	<button
		class="btn join-item h-4 min-h-4 w-4 min-w-4 p-0"
		on:click={() => {
			value += step;
			if (max !== null) value = value > max ? max : value;
		}}
	>
		<Icon src={PlusSmall}></Icon>
	</button>
	<button
		class="btn join-item h-4 min-h-4 w-4 min-w-4 p-0"
		on:click={() => {
			value -= step;
			if (min !== null) value = value < min ? min : value;
		}}
	>
		<Icon src={MinusSmall}></Icon>
	</button>
</div>
