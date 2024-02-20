<script lang="ts">
	import { base } from '$app/paths';
	import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from '@steeze-ui/heroicons';
	import { Icon } from '@steeze-ui/svelte-icon';
	import type { LayoutData } from './$types';

	export let data: LayoutData;
	$: console.log(data);
	let currentCategoryName: 'core' | 'custom' = 'core';
	let currentPageIndex = 0;
	$: currentCategoryRoutes = data.routes[currentCategoryName] ?? [];
	$: currentPage = currentCategoryRoutes[currentPageIndex];

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
			{#if currentPageIndex >= 1}
				{@const previousPage = currentCategoryRoutes[currentPageIndex - 1]}
				<a
					href={`${base}/practice/${currentCategoryName}/${previousPage.slug}`}
					on:click={() => currentPageIndex--}
					class="color-indigo-4 hover:color-indigo-6 active:color-indigo-8 mr-8 flex h-full cursor-pointer select-none flex-row items-center gap-4 transition duration-200"
				>
					<Icon class="h-[30px] w-auto" src={ChevronLeft} theme="solid" />
					<span class="color-black invisible whitespace-nowrap lg:visible"
						>{previousPage.title}</span
					>
				</a>
			{:else}
				<div
					class="color-gray mr-8 flex h-full select-none flex-row items-center gap-4 transition duration-200"
				>
					<Icon class="h-[30px] w-auto" src={ChevronLeft} theme="solid" />
				</div>
			{/if}
			{#if currentPageIndex < currentCategoryRoutes.length - 1}
				{@const nextPage = currentCategoryRoutes[currentPageIndex + 1]}
				<a
					href={`${base}/practice/${currentCategoryName}/${nextPage.slug}`}
					on:click={() => currentPageIndex++}
					class="color-indigo-400 hover:color-indigo-600 active:color-indigo-800 ml-8 flex h-full cursor-pointer select-none flex-row items-center gap-4 transition duration-200"
				>
					<span class="color-black invisible whitespace-nowrap lg:visible">{nextPage.title}</span>
					<Icon class="h-[30px] w-auto" src={ChevronRight} theme="solid" />
				</a>
			{:else}
				<div
					class="color-gray ml-8 flex h-full select-none flex-row items-center gap-4 transition duration-200"
				>
					<Icon class="h-[30px] w-auto" src={ChevronRight} theme="solid" />
				</div>
			{/if}
		</div>
		<button
			class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
			on:click={() => (practiceListOpen = !practiceListOpen)}
		>
			<div class="absolute -top-[30px] left-[50%] h-[40px] w-auto -translate-x-[50%]">
				<Icon
					class="opacity-25% hover:opacity-100% h-[20px] w-auto cursor-pointer transition-opacity"
					src={practiceListOpen ? ChevronDown : ChevronUp}
					theme="mini"
				/>
				{#if practiceListOpen}
					<div
						class="absolute bottom-full left-1/2 max-h-80 w-80 -translate-x-1/2 -translate-y-[1rem] rounded bg-gray-500 p-4"
					>
						{#each currentCategoryRoutes as route}
							<div class="text-start">
								<a href={`${base}/practice/${currentCategoryName}/${route.slug}`}>
									{route.title}
								</a>
							</div>
						{/each}
					</div>
				{/if}
			</div>
			<p class="whitespace-nowrap">{currentPage.title}</p>
		</button>
	</nav>
</div>
