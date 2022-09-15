<script lang="ts">
  import RandomBox from "@components/RandomBox.svelte";
  import MelodyTone from "./MelodyTone.svelte";

  const pitchData = [
    {
      pitch: "AJ",
      fingers: [
        { line: 1, fret: 5 },
        { line: 2, fret: 12 },
        { line: 3, fret: 7 },
        { line: 4, fret: 2 },
        { line: 5, fret: 10 },
        { line: 6, fret: 5 },
      ],
    },
    {
      pitch: "Am7",
      fingers: [
        { line: 1, fret: 7 },
        { line: 2, fret: 2 },
        { line: 3, fret: 9 },
        { line: 4, fret: 4 },
        { line: 5, fret: 12 },
        { line: 6, fret: 7 },
      ],
    },
    {
      pitch: "C",
      fingers: [
        { line: 1, fret: 8 },
        { line: 2, fret: 3 },
        { line: 3, fret: 10 },
        { line: 4, fret: 5 },
        { line: 5, fret: 1 },
        { line: 6, fret: 8 },
      ],
    },
    {
      pitch: "D",
      fingers: [
        { line: 1, fret: 10 },
        { line: 2, fret: 5 },
        { line: 3, fret: 12 },
        { line: 4, fret: 7 },
        { line: 5, fret: 3 },
        { line: 6, fret: 10 },
      ],
    },
    {
      pitch: "E",
      fingers: [
        { line: 1, fret: 12 },
        { line: 2, fret: 7 },
        { line: 3, fret: 2 },
        { line: 4, fret: 9 },
        { line: 5, fret: 5 },
        { line: 6, fret: 12 },
      ],
    },
    {
      pitch: "F",
      fingers: [
        { line: 1, fret: 1 },
        { line: 2, fret: 8 },
        { line: 3, fret: 3 },
        { line: 4, fret: 10 },
        { line: 5, fret: 6 },
        { line: 6, fret: 1 },
      ],
    },
    {
      pitch: "G",
      fingers: [
        { line: 1, fret: 3 },
        { line: 2, fret: 10 },
        { line: 3, fret: 5 },
        { line: 4, fret: 12 },
        { line: 5, fret: 8 },
        { line: 6, fret: 3 },
      ],
    },
  ];

  $: isFingerboardHidden = false;
  $: components = pitchData.map((datum) => {
    return {
      component: MelodyTone,
      props: { ...datum, isFingerboardHidden: isFingerboardHidden },
    };
  });
</script>

<div class="h-full w-screen">
  <RandomBox shuffleMode="all-done" {components} />
</div>
