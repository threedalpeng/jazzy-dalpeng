<script lang="ts">
	import { clickoutside } from '$/utils/hooks/click-outside';
	import { base } from '$app/paths';
	import type { Snippet } from 'svelte';
	import ChevronDown from '~icons/heroicons/chevron-down-16-solid';
	import ChevronLeft from '~icons/heroicons/chevron-left-solid';
	import ChevronRight from '~icons/heroicons/chevron-right-solid';
	import ChevronUp from '~icons/heroicons/chevron-up-16-solid';
	import type { LayoutData } from './$types';

	interface PracticeLayoutProps {
		data: LayoutData;
		children: Snippet;
	}
	const { data, children }: PracticeLayoutProps = $props();

	let practiceListOpen = $state<boolean>(false);
</script>

<div class="flex h-screen w-screen flex-col">
	<header class="flex h-[60px] w-screen flex-row items-center">
		<span class="ml-8 font-jazz text-2xl font-bold"> JazzyDalpeng / Jazz Guitar Practice</span>
	</header>
	<div class="flex basis-full flex-col items-center justify-center">
		{@render children()}
	</div>
	<nav class="relative h-[60px] w-screen">
		<div class="flex h-full flex-row items-center justify-between">
			{#if data.pages.previous}
				<a
					href={`${base}/practice/${data.category}/${data.pages.previous.slug}`}
					class="mr-8 flex h-full cursor-pointer select-none flex-row items-center gap-4 text-indigo-400 transition duration-200 hover:text-indigo-600 active:text-indigo-800"
				>
					<ChevronLeft class="h-[30px] w-auto" />
					<span
						class="invisible whitespace-nowrap text-black hover:text-indigo-600 active:text-indigo-800 lg:visible"
						>{data.pages.previous.title}</span
					>
				</a>
			{:else}
				<div
					class="mr-8 flex h-full select-none flex-row items-center gap-4 text-gray-300 transition duration-200"
				>
					<ChevronLeft class="h-[30px] w-auto" />
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
					<ChevronRight class="h-[30px] w-auto" />
				</a>
			{:else}
				<div
					class="ml-8 flex h-full select-none flex-row items-center gap-4 text-gray-300 transition duration-200"
				>
					<ChevronRight class="h-[30px] w-auto" />
				</div>
			{/if}
		</div>
		<button
			class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
			onclick={() => (practiceListOpen = !practiceListOpen)}
		>
			<div
				use:clickoutside
				onclickoutside={() => (practiceListOpen = false)}
				class="absolute -top-[30px] left-[50%] h-[40px] w-auto -translate-x-[50%]"
			>
				{#if practiceListOpen}
					<ChevronDown
						class="opacity-25% hover:opacity-100% h-[20px] w-auto cursor-pointer transition-opacity"
					/>
				{:else}
					<ChevronUp
						class="opacity-25% hover:opacity-100% h-[20px] w-auto cursor-pointer transition-opacity"
					/>
				{/if}
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
