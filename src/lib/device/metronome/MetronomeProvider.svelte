<script lang="ts">
  import { onDestroy } from "svelte";
  import { setMetronomeContext } from "./context";

  export let beatPerBar = 4;
  export let beatUnit = 4;
  export let bpm = 120;

  const metronome = setMetronomeContext({ beatPerBar, beatUnit, bpm });

  onDestroy(() => {
    metronome.destroy();
  });
</script>

<slot />
