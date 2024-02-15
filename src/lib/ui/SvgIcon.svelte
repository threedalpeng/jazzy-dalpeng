<script lang="ts">
	import type { SVGAttributes } from 'svelte/elements';

	interface $$Props extends SVGAttributes<SVGElement> {}
</script>

<svg {...$$restProps}>
	<slot />
</svg>
