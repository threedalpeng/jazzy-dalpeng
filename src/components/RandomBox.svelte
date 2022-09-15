<script lang="ts">
  import { Play, Stop } from "@steeze-ui/heroicons";
  import { Icon } from "@steeze-ui/svelte-icon";

  import { onDestroy } from "svelte";
  import BeatPresenter from "./Practice/BeatPresenter.svelte";
  import { getInstrument } from "./utils/audio";
  import { debounce } from "./utils/basic";

  export let bpm = 120;
  export let beat = 4;
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

  let timerId;
  let timerRunning = false;
  function toggleAutoShuffle() {
    if (timerRunning) {
      stopAutoShuffle();
    } else {
      startAutoShuffle();
    }
  }

  let beatCount = 0;
  let debouncedSpeed = 60000 / bpm;
  $: debounce(() => {
    if (beat && bpm && beat > 0 && bpm >= 40) {
      debouncedSpeed = 60000 / bpm;
      restartAutoShuffle();
    }
  }, 200);
  async function startAutoShuffle() {
    if (!marimba) marimba = await getInstrument("marimba");
    timerRunning = true;
    timerId = window.setInterval(() => {
      if (beatCount >= beat) {
        beatCount = 0;
        openBox();
      }
      if (beatCount === 0) {
        playMarimba("C5");
      } else {
        playMarimba("C4");
      }
      beatCount++;
    }, debouncedSpeed);
  }
  function stopAutoShuffle() {
    timerRunning = false;
    beatCount = 0;
    window.clearInterval(timerId);
  }
  function restartAutoShuffle() {
    if (timerRunning) {
      stopAutoShuffle();
      startAutoShuffle();
    }
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

  let marimba;
  const playMarimba = async (key: string) => {
    marimba.play(key);
  };

  onDestroy(() => {
    stopAutoShuffle();
  });
</script>

<div class="relative h-full">
  <div
    class="h-60px z-1 absolute right-0 flex w-screen flex-row items-center  justify-between"
  >
    <div class="ml-8 flex flex-row gap-4">
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
    </div>
    <button
      class="bg-indigo-9 aspect-1 mr-8 flex h-3/4 items-center justify-center rounded-full p-0 focus:outline-none"
      on:click={toggleAutoShuffle}
    >
      {#if timerRunning}
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
    <BeatPresenter {beat} {beatCount} />
  </div>
</div>
