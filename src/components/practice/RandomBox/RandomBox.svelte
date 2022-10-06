<script lang="ts">
  import { getMetronomeContext } from "@components/device/metronome/context";
  import { Play, Stop } from "@steeze-ui/heroicons";
  import { Icon } from "@steeze-ui/svelte-icon";

  import { onDestroy, onMount } from "svelte";
  import BeatPresenter from "@components/device/metronome/BeatPresenter.svelte";

  const metronome = getMetronomeContext();

  let bpm;
  let beatUnit;
  let beatPerBar;
  let isRunning;
  onMount(() => {
    bpm = metronome.bpm;
    beatUnit = metronome.beatUnit;
    beatPerBar = metronome.beatPerBar;
    isRunning = metronome.isRunning;
    metronome.onBar((state) => {
      bpm = state.bpm;
      beatUnit = state.beatUnit;
      beatPerBar = state.beatPerBar;
      isRunning = metronome.isRunning;
      openBox();
    });
  });

  export let shuffleMode: "each-turn" | "all-done" = "all-done";
  export let components: {
    component: any;
    props: any;
  }[] = [];
  let selectedComponent = components[0];
  let remainedComponents = components.slice(1);

  function getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }

  function toggleAutoShuffle() {
    metronome.toggle();
  }
  function startAutoShuffle() {
    metronome.run();
  }
  function stopAutoShuffle() {
    metronome.stop();
  }

  function openBox() {
    let randInt;
    switch (shuffleMode) {
      case "each-turn":
        randInt = getRandomInt(0, remainedComponents.length);
        selectedComponent = remainedComponents[randInt];
        remainedComponents = components.filter(
          (component) => !Object.is(component, selectedComponent)
        );
        break;
      case "all-done":
        if (remainedComponents.length === 0) {
          randInt = getRandomInt(0, components.length);
          selectedComponent = components[randInt];
          remainedComponents = components.filter(
            (component) => !Object.is(component, selectedComponent)
          );
        } else {
          randInt = getRandomInt(0, remainedComponents.length);
          selectedComponent = remainedComponents[randInt];
          remainedComponents = remainedComponents.filter(
            (component) => !Object.is(component, selectedComponent)
          );
        }
        break;
    }
  }

  function initiateRemainedComponent() {
    let randInt = getRandomInt(0, components.length);
    selectedComponent = components[randInt];
    remainedComponents = components.filter(
      (component) => !Object.is(component, selectedComponent)
    );
  }
</script>

<div class="relative h-full">
  <div
    class="h-60px z-1 absolute right-0 flex w-screen flex-row items-center  justify-between"
  >
    <!-- <div class="ml-8 flex flex-row gap-4">
      <div class="flex h-full flex-col items-start justify-between">
        <label for="shuffle-mode" class="text-sm">Shuffle Mode</label>
        <select
          id="shuffle-mode"
          class="bg-right-center b-0 border-b-3 focus:border-b-3 focus:b-0 focus:border-b-indigo-3 border-gray-3 appearance-none py-1 pr-6 pl-3 text-base ring-0 transition ease-in-out focus:text-gray-700
           focus:outline-none focus:ring-0"
          bind:value={shuffleMode}
          on:change={initiateRemainedComponent}
        >
          <option value="each-turn">Each Turn</option>
          <option value="all-done">All Done</option>
        </select>
      </div>
      <div class="flex h-full flex-col items-start justify-between">
        <label for="shuffle-bpm" class="text-sm">BPM</label>
        <input
          id="shuffle-bpm"
          type="number"
          min="20"
          max="500"
          class="b-0 border-b-3 focus:border-b-3 focus:b-0 focus:border-b-indigo-3 border-gray-3 appearance-none px-3 py-1 text-base ring-0 transition ease-in-out focus:text-gray-700 focus:outline-none focus:ring-0"
          bind:value={bpm}
        />
      </div>
      <div class="flex h-full flex-col items-start justify-between">
        <label for="shuffle-beat" class="text-sm">Beat</label>
        <input
          id="shuffle-beat"
          type="number"
          min="1"
          max="12"
          class="b-0 border-b-3 focus:border-b-3 focus:b-0 focus:border-b-indigo-3 border-gray-3 appearance-none px-3 py-1 text-base ring-0 transition ease-in-out focus:text-gray-700 focus:outline-none focus:ring-0"
          bind:value={beat}
        />
      </div>
    </div> -->
    <button
      class="bg-indigo-9 aspect-1 mr-8 flex h-3/4 items-center justify-center rounded-full p-0 focus:outline-none"
      on:click={toggleAutoShuffle}
    >
      {#if metronome.isRunning}
        <Icon
          class="color-indigo-1 h-20px w-20px m-0 p-0"
          src={Stop}
          theme="solid"
        />
      {:else}
        <Icon
          class="color-indigo-1 h-20px w-20px  m-0 p-0"
          src={Play}
          theme="solid"
        />
      {/if}
    </button>
  </div>
  <div class="relative flex h-full flex-col items-center justify-center">
    <div on:click={openBox}>
      <svelte:component
        this={selectedComponent.component}
        {...selectedComponent.props}
      />
    </div>
    <BeatPresenter />
  </div>
</div>
