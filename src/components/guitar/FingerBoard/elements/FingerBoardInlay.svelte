<script lang="ts">
  import { Circle } from "@canvas";
  import {
    getFingerBoardContext,
    getXFromFretNumber,
    getYFromStringNumber,
  } from "../context";

  const { INLAY_RADIUS, INLAY_STROKE_STYLE, INLAY_FILL_STYLE } =
    getFingerBoardContext();

  const inlaySchemes = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24];
</script>

{#each inlaySchemes as inlay}
  {#if inlay % 12 === 0}
    <Circle
      x={getXFromFretNumber(inlay - 0.5)}
      y={getYFromStringNumber(2.5)}
      radius={INLAY_RADIUS}
      strokeStyle={INLAY_STROKE_STYLE}
      fillStyle={INLAY_FILL_STYLE}
      lineWidth={2}
    />
    <Circle
      x={getXFromFretNumber(inlay - 0.5)}
      y={getYFromStringNumber(4.5)}
      radius={INLAY_RADIUS}
      strokeStyle={INLAY_STROKE_STYLE}
      fillStyle={INLAY_FILL_STYLE}
      lineWidth={2}
    />
  {:else}
    <Circle
      x={getXFromFretNumber(inlay - 0.5)}
      y={getYFromStringNumber(3.5)}
      radius={INLAY_RADIUS}
      strokeStyle={INLAY_STROKE_STYLE}
      fillStyle={INLAY_FILL_STYLE}
      lineWidth={2}
    />
  {/if}
{/each}
