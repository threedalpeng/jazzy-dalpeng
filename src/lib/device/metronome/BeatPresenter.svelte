<script lang="ts">
  import { getMetronomeContext } from "./context";
  import { onMount } from "svelte";

  const metronome = getMetronomeContext();

  let beatPerBar = 4,
    currentBeat = 0;
  onMount(() => {
    beatPerBar = metronome.state.beatPerBar;
    currentBeat = metronome.state.currentBeat;
    metronome.onBeat((state) => {
      beatPerBar = state.beatPerBar;
      currentBeat = state.currentBeat;
    });
  });
</script>

<div
  class="gap-40px top-60px relative flex w-screen flex-row items-center justify-center"
>
  {#each new Array(beatPerBar) as _, index}
    {#if index === 0}
      {#if index === currentBeat - 1}
        <div class="w-30px h-30px rounded-full bg-indigo-500" />
      {:else}
        <div class="w-30px h-30px rounded-full bg-indigo-900" />
      {/if}
    {:else if index === currentBeat - 1}
      <div class="w-20px h-20px rounded-full bg-indigo-500" />
    {:else}
      <div class="w-20px h-20px rounded-full bg-indigo-900" />
    {/if}
  {/each}
</div>
