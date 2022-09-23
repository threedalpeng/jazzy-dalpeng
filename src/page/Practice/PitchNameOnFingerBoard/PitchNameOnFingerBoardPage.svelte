<script lang="ts">
  import type { ChordName, ChordRoot } from "@/utils/chords";
  import RandomBox from "@components/RandomBox.svelte";
  import Board from "./Board.svelte";

  const pitchData: {
    root: ChordRoot;
    name: ChordName;
    fingers: { line: number; fret: number }[];
  }[] = [
    {
      root: "A",
      name: "none",
      fingers: [
        { line: 1, fret: 5 },
        { line: 2, fret: 10 },
        { line: 3, fret: 2 },
        { line: 4, fret: 7 },
        { line: 5, fret: 12 },
        { line: 6, fret: 5 },
      ],
    },
    {
      root: "B",
      name: "none",
      fingers: [
        { line: 1, fret: 7 },
        { line: 2, fret: 12 },
        { line: 3, fret: 4 },
        { line: 4, fret: 9 },
        { line: 5, fret: 2 },
        { line: 6, fret: 7 },
      ],
    },
    {
      root: "C",
      name: "none",
      fingers: [
        { line: 1, fret: 8 },
        { line: 2, fret: 1 },
        { line: 3, fret: 5 },
        { line: 4, fret: 10 },
        { line: 5, fret: 3 },
        { line: 6, fret: 8 },
      ],
    },
    {
      root: "D",
      name: "none",
      fingers: [
        { line: 1, fret: 10 },
        { line: 2, fret: 3 },
        { line: 3, fret: 7 },
        { line: 4, fret: 12 },
        { line: 5, fret: 5 },
        { line: 6, fret: 10 },
      ],
    },
    {
      root: "E",
      name: "none",
      fingers: [
        { line: 1, fret: 12 },
        { line: 2, fret: 5 },
        { line: 3, fret: 9 },
        { line: 4, fret: 2 },
        { line: 5, fret: 7 },
        { line: 6, fret: 12 },
      ],
    },
    {
      root: "F",
      name: "none",
      fingers: [
        { line: 1, fret: 1 },
        { line: 2, fret: 6 },
        { line: 3, fret: 10 },
        { line: 4, fret: 3 },
        { line: 5, fret: 8 },
        { line: 6, fret: 1 },
      ],
    },
    {
      root: "G",
      name: "none",
      fingers: [
        { line: 1, fret: 3 },
        { line: 2, fret: 8 },
        { line: 3, fret: 12 },
        { line: 4, fret: 5 },
        { line: 5, fret: 10 },
        { line: 6, fret: 3 },
      ],
    },
  ];

  $: isFingerboardHidden = false;
  $: components = pitchData.map((datum) => {
    return {
      component: Board,
      props: { ...datum, isFingerboardHidden: isFingerboardHidden },
    };
  });
</script>

<div class="h-full w-screen">
  <RandomBox beat={6} {components} />
</div>
