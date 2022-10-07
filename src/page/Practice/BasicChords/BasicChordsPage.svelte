<script lang="ts">
  import type { ChordName } from "@/utils/music/chords";
  import MetronomeProvider from "@components/device/metronome/MetronomeProvider.svelte";
  import RandomBox from "@components/practice/RandomBox/RandomBox.svelte";
  import Board from "./Board.svelte";

  const chordsForm: {
    rootline: number;
    forms: { name: ChordName; offsets: { [line: number]: number } }[];
  }[] = [
    {
      rootline: 6,
      forms: [
        {
          name: "majorSeventh",
          offsets: {
            2: 0,
            3: 1,
            4: 1,
            6: 0,
          },
        },
        {
          name: "dominantSeventh",
          offsets: {
            2: 0,
            3: 1,
            4: 0,
            6: 0,
          },
        },
        {
          name: "minorSeventh",
          offsets: {
            2: 0,
            3: 0,
            4: 0,
            6: 0,
          },
        },
        {
          name: "halfDiminishedSeventh",
          offsets: {
            2: -1,
            3: 0,
            4: 0,
            6: 0,
          },
        },
      ],
    },
    {
      rootline: 5,
      forms: [
        {
          name: "dominantSeventh",
          offsets: {
            2: 2,
            3: 1,
            4: 2,
            5: 0,
          },
        },
        {
          name: "majorSeventh",
          offsets: {
            2: 2,
            3: 0,
            4: 2,
            5: 0,
          },
        },
        {
          name: "minorSeventh",
          offsets: {
            2: 1,
            3: 0,
            4: 2,
            5: 0,
          },
        },
        {
          name: "halfDiminishedSeventh",
          offsets: {
            2: 1,
            3: 0,
            4: 1,
            5: 0,
          },
        },
      ],
    },
  ];

  const rootPitch = "C";
  const pitchData = chordsForm.flatMap((chordsFormOfRootline) => {
    const rootline = chordsFormOfRootline.rootline;
    const rootfret = rootline === 5 ? 3 : 8;
    return chordsFormOfRootline.forms.map((form) => {
      return {
        root: rootPitch,
        name: form.name,
        fingers: Object.entries(form.offsets).map(([line, offset]) => {
          return { line: parseInt(line), fret: offset + rootfret };
        }),
        fretRange: {
          start: rootfret - 2,
          end: rootfret + 2,
          visibility: "start",
        },
      };
    });
  });

  $: isFingerboardHidden = false;
  $: components = pitchData.map((datum) => {
    return {
      component: Board,
      props: { ...datum, isFingerboardHidden: isFingerboardHidden },
    };
  });
</script>

<div class="h-full w-screen">
  <MetronomeProvider
    ><RandomBox shuffleMode="all-done" {components} /></MetronomeProvider
  >
</div>
