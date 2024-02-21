<script lang="ts">
	import { clickoutside } from '$/utils/hooks/click-outside';
	import { base } from '$app/paths';
	import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from '@steeze-ui/heroicons';
	import { Icon } from '@steeze-ui/svelte-icon';
	import type { LayoutData } from './$types';

	export let data: LayoutData;

	let practiceListOpen: boolean = false;
</script>

<div class="flex h-screen w-screen flex-col">
	<header class="flex h-[60px] w-screen flex-row items-center">
		<span class="ml-8 font-jazz text-2xl font-bold"> JazzyDalpeng / Jazz Guitar Practice</span>
	</header>
	<div class="flex basis-full flex-col items-center justify-center">
		<slot />
	</div>
	<nav class="relative h-[60px] w-screen">
		<div class="flex h-full flex-row items-center justify-between">
			{#if data.pages.previous}
				<a
					href={`${base}/practice/${data.category}/${data.pages.previous.slug}`}
					class="mr-8 flex h-full cursor-pointer select-none flex-row items-center gap-4 text-indigo-400 transition duration-200 hover:text-indigo-600 active:text-indigo-800"
				>
					<Icon class="h-[30px] w-auto" src={ChevronLeft} theme="solid" />
					<span
						class="invisible whitespace-nowrap text-black hover:text-indigo-600 active:text-indigo-800 lg:visible"
						>{data.pages.previous.title}</span
					>
				</a>
			{:else}
				<div
					class="mr-8 flex h-full select-none flex-row items-center gap-4 text-gray-300 transition duration-200"
				>
					<Icon class="h-[30px] w-auto" src={ChevronLeft} theme="solid" />
				</div>
			{/if}
			{#if data.pages.next}
				<a
					href={`${base}/practice/${data.category}/${data.pages.next.slug}`}
					class="ml-8 flex h-full cursor-pointer select-none flex-row items-center gap-4 text-indigo-400 transition duration-200 hover:text-indigo-600 active:text-indigo-800"
				>
					<span
						class="invisible whitespace-nowrap text-black hover:text-indigo-600 active:text-indigo-800 lg:visible"
						>{data.pages.next.title}</span
					>
					<Icon class="h-[30px] w-auto" src={ChevronRight} theme="solid" />
				</a>
			{:else}
				<div
					class="ml-8 flex h-full select-none flex-row items-center gap-4 text-gray-300 transition duration-200"
				>
					<Icon class="h-[30px] w-auto" src={ChevronRight} theme="solid" />
				</div>
			{/if}
		</div>
		<button
			class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
			on:click={() => (practiceListOpen = !practiceListOpen)}
		>
			<div
				use:clickoutside
				on:clickoutside={() => (practiceListOpen = false)}
				class="absolute -top-[30px] left-[50%] h-[40px] w-auto -translate-x-[50%]"
			>
				<Icon
					class="opacity-25% hover:opacity-100% h-[20px] w-auto cursor-pointer transition-opacity"
					src={practiceListOpen ? ChevronDown : ChevronUp}
					theme="mini"
				/>
				{#if practiceListOpen}
					<div
						class="absolute bottom-full left-1/2 max-h-80 w-80 -translate-x-1/2 -translate-y-[1rem] rounded bg-gray-500 p-4"
					>
						{#each data.routes[data.category] as route}
							<div class="text-start">
								<a href={`${base}/practice/${data.category}/${route.slug}`}>
									{route.title}
								</a>
							</div>
						{/each}
					</div>
				{/if}
			</div>
			<p class="whitespace-nowrap">{data.pages.current.title}</p>
		</button>
	</nav>
</div>
