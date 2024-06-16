<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { SVGAttributes } from 'svelte/elements';

	interface SvgIconProps extends SVGAttributes<SVGElement> {
		children: Snippet;
	}
	const { children, ...rest }: SvgIconProps = $props();
</script>

<svg {...rest}>
	{@render children()}
</svg>
