<script lang="ts">
  import ChordNotation from "@/components/notation/ChordNotation.svelte";
  import type { ChordName, ChordRoot } from "@/utils/chords";
  import FingerBoard from "@components/guitar/FingerBoard/FingerBoard.svelte";

  export let root: ChordRoot;
  export let name: ChordName;
  export let fingers;
  export let isFingerboardHidden = false;
</script>

<div
  class="leading-1.2em font-chord text-80px mb-0.5em block h-fit select-none text-center"
>
  <ChordNotation {root} {name} />
</div>
{#if !isFingerboardHidden}
  <FingerBoard
    {fingers}
    fretRange={{ start: 0, end: 12, visibility: "none" }}
  />
{/if}
