<script lang="ts">
  import { ChevronLeft, ChevronRight, ChevronUp } from "@steeze-ui/heroicons";
  import { Icon } from "@steeze-ui/svelte-icon";
  import { Link, navigate, Route, Router } from "svelte-routing";
  import RootWithPitchNamePage from "./RootWithPitchName/RootWithPitchNamePage.svelte";
  import BasicChordsPage from "./BasicChords/BasicChordsPage.svelte";
  import PitchNameOnFingerBoardPage from "./PitchNameOnFingerBoard/PitchNameOnFingerBoardPage.svelte";
  import MetronomeProvider from "@/components/device/metronome/MetronomeProvider.svelte";

  const routes = [
    {
      name: "Root with Pitch Name",
      component: RootWithPitchNamePage,
    },
    {
      name: "Pitch Name on Finger Board",
      component: PitchNameOnFingerBoardPage,
    },
    {
      name: "Basic Chords",
      component: BasicChordsPage,
    },
  ].map((route, idx) => {
    const name = `${(idx + 1).toString().padStart(2, "0")}. ${route.name}`;
    const to = name.toLowerCase().replaceAll(".", "").replaceAll(" ", "-");
    return {
      ...route,
      name,
      to,
    };
  });
  let currentPageIndex = 0;
</script>

<Router>
  <div class="flex h-screen w-screen flex-col">
    <div class="h-60px flex w-screen flex-row items-center">
      <span class="font-jazz ml-8 text-2xl font-bold">
        JazzyDalpeng / Jazz Guitar Practice</span
      >
    </div>
    <div class="flex basis-full flex-col items-center justify-center">
      {#each routes as route}
        <Route path={route.to} component={route.component} />
      {/each}
    </div>
    <nav class="h-60px relative w-screen">
      <div class="flex h-full flex-row items-center justify-between">
        {#if currentPageIndex >= 1}
          <Link
            to={routes[currentPageIndex - 1].to}
            on:click={() => currentPageIndex--}
            class="hover:color-indigo-4 active:color-indigo-8 mr-8 flex h-full cursor-pointer select-none flex-row items-center gap-4 transition duration-200"
          >
            <Icon class="h-40px w-auto" src={ChevronLeft} theme="solid" />
            <span class="invisible whitespace-nowrap lg:visible"
              >{routes[currentPageIndex - 1].name}</span
            >
          </Link>
        {:else}
          <div
            class="color-gray mr-8 flex h-full select-none flex-row items-center gap-4 transition duration-200"
          >
            <Icon class="h-40px w-auto" src={ChevronLeft} theme="solid" />
          </div>
        {/if}
        {#if currentPageIndex < routes.length - 1}
          <Link
            to={routes[currentPageIndex + 1].to}
            on:click={() => currentPageIndex++}
            class="hover:color-indigo-4 active:color-indigo-8 ml-8 flex h-full cursor-pointer select-none flex-row items-center gap-4 transition duration-200"
          >
            <span class="invisible whitespace-nowrap lg:visible"
              >{routes[currentPageIndex + 1].name}</span
            >
            <Icon class="h-40px w-auto" src={ChevronRight} theme="solid" />
          </Link>
        {:else}
          <div
            class="color-gray ml-8 flex h-full select-none flex-row items-center gap-4 transition duration-200"
          >
            <Icon class="h-40px w-auto" src={ChevronRight} theme="solid" />
          </div>
        {/if}
      </div>
      <div class="absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2">
        <div class="-top-30px left-50% -translate-x-50% h-40px absolute w-auto">
          <Icon
            class="opacity-25% hover:opacity-100% cursor-pointer transition-opacity"
            src={ChevronUp}
            theme="mini"
          />
        </div>
        <p class="whitespace-nowrap">
          {routes[currentPageIndex].name}
        </p>
      </div>
    </nav>
  </div>
</Router>
