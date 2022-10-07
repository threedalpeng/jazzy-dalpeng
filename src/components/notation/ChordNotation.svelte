<script lang="ts">
  import {
    getChordNotations,
    type ChordName,
    type ChordRoot,
  } from "@/utils/music/chords";

  export let root: ChordRoot;
  export let name: ChordName;

  $: chordNotations = getChordNotations(root, name);
</script>

<span class="font-chord">
  {chordNotations.default.short}
</span>
