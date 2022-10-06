<script lang="ts">
  import MetronomeProvider from "@/components/device/metronome/MetronomeProvider.svelte";
  import RandomBox from "@/components/practice/RandomBox/RandomBox.svelte";
  import Board from "./Board.svelte";

  const pitchData = [
    {
      root: "A",
      name: "none",
      fingers: [
        { line: 5, fret: "open" },
        { line: 5, fret: 12 },
        { line: 6, fret: 5 },
      ],
    },
    {
      root: "B",
      name: "none",
      fingers: [
        { line: 5, fret: 2 },
        { line: 6, fret: 7 },
      ],
    },
    {
      root: "C",
      name: "none",
      fingers: [
        { line: 5, fret: 3 },
        { line: 6, fret: 8 },
      ],
    },
    {
      root: "D",
      name: "none",
      fingers: [
        { line: 5, fret: 5 },
        { line: 6, fret: 10 },
      ],
    },
    {
      root: "E",
      name: "none",
      fingers: [
        { line: 5, fret: 7 },
        { line: 6, fret: "open" },
        { line: 6, fret: 12 },
      ],
    },
    {
      root: "F",
      name: "none",
      fingers: [
        { line: 5, fret: 8 },
        { line: 6, fret: 1 },
      ],
    },
    {
      root: "G",
      name: "none",
      fingers: [
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
  <MetronomeProvider><RandomBox {components} /></MetronomeProvider>
</div>
