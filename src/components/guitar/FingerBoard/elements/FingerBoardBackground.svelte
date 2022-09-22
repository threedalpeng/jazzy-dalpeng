<script lang="ts">
  import { Line } from "@canvas";
  import { getFingerBoardContext } from "../context";
  import FingerBoardInlay from "./FingerBoardInlay.svelte";

  export let inlayVisible: boolean = true;
  const {
    FRET_START,
    FRET_GAP,
    FRET_WIDTH,
    STRING_START,
    STRING_GAP,
    STRING_WIDTH,
    FRET_MAX,
  } = getFingerBoardContext();

  const stringLines: { x: number; y: number }[][] = [];
  for (let i = 0; i < 6; i++) {
    stringLines.push([
      { x: FRET_START - 2, y: STRING_START + STRING_GAP * i },
      { x: FRET_START + FRET_GAP * FRET_MAX, y: STRING_START + STRING_GAP * i },
    ]);
  }
  const fretLines: { x: number; y: number }[][] = [];
  for (let i = 0; i <= FRET_MAX; i++) {
    fretLines.push([
      { x: FRET_START + FRET_GAP * i, y: STRING_START },
      { x: FRET_START + FRET_GAP * i, y: STRING_START + STRING_GAP * 5 },
    ]);
  }
</script>

{#each fretLines.slice(1) as points}
  <Line {points} lineCap="round" lineWidth={FRET_WIDTH} strokeStyle="#333" />
{/each}
{#each stringLines as points}
  <Line
    {points}
    lineCap="round"
    lineWidth={STRING_WIDTH + 1}
    strokeStyle="#000"
  />
{/each}
<Line
  points={fretLines[0].map((line) => {
    return { x: line.x - 2, y: line.y };
  })}
  lineCap="round"
  lineWidth={FRET_WIDTH + 4}
  strokeStyle="#555"
/>
{#if inlayVisible}
  <FingerBoardInlay />
{/if}
