<script lang="ts" module>
	export { mount } from 'svelte';
</script>

<script lang="ts">
	import { Canvas, Clear, Crop, Rectangle } from '../index';
	let result = $state('');
	let frontActive = $state(true);
	let color = $state('blue');
	let showChild = $state(true);
	let colors = $state(['yellow', 'orange']);
	let erased = $state(false);
</script>

<button onclick={() => (frontActive = !frontActive)}>Toggle front</button>
<button onclick={() => (color = color === 'blue' ? 'purple' : 'blue')}>Change cached color</button>
<button onclick={() => (showChild = !showChild)}>Toggle child</button>
<button onclick={() => (colors = [...colors].reverse())}>Reverse layers</button>
<button onclick={() => (erased = !erased)}>Erase corner</button>
<output aria-label="Hit result">{result}</output>
<Canvas width={100} height={100} aria-label="Renderer test" style="width: 200px; height: 200px;">
	<Rectangle
		x={0}
		y={0}
		width={100}
		height={100}
		fillStyle="red"
		active
		onclick={() => (result = 'red')}
	/>
	{#if showChild}
		<Crop
			width={100}
			height={100}
			sourceArea={{ x: 10, y: 10, width: 40, height: 40 }}
			destArea={{ x: 20, y: 20, width: 60, height: 60 }}
			cached
			cacheKey={color}
		>
			<Crop width={100} height={100}>
				<Rectangle
					x={10}
					y={10}
					width={40}
					height={40}
					fillStyle={color}
					active
					onclick={() => (result = 'child')}
				/>
			</Crop>
		</Crop>
	{/if}
	<Rectangle
		x={40}
		y={40}
		width={20}
		height={20}
		fillStyle="green"
		active={frontActive}
		onclick={() => (result = 'green')}
	/>
	{#each colors as fillStyle (fillStyle)}
		<Rectangle
			x={0}
			y={80}
			width={20}
			height={20}
			{fillStyle}
			active
			onclick={() => (result = fillStyle)}
		/>
	{/each}
	{#if erased}
		<Clear x={90} y={90} width={10} height={10} removeHitRegion />
	{/if}
</Canvas>
