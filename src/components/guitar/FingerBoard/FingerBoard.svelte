<script lang="ts" context="module">
  export interface FingerPosition {
    line: number;
    fret: number | "mute" | "open";
  }
</script>

<script lang="ts">
  import { Canvas, Circle, Text, Crop } from "@canvas";
  import {
    getXFromFretNumber,
    getYFromStringNumber,
    setFingerBoardContext,
  } from "./context";
  import FingerBoardBackground from "./elements/FingerBoardBackground.svelte";

  const {
    FRET_START,
    FRET_GAP,
    STRING_START,
    STRING_GAP,
    FINGER_RADIUS,
    FRET_MAX,
  } = setFingerBoardContext();

  export let fretRange: {
    start: number;
    end: number;
    visibility: "none" | "all" | "start" | "end";
  } = {
    start: 3,
    end: 12,
    visibility: "start",
  };
  const fretNumberPadding = 0.3;
  $: fretRangeGap = fretRange.end - fretRange.start;
  $: fretRangeWidth = FRET_GAP * (fretRangeGap + fretNumberPadding * 2);

  export let fingers: FingerPosition[] = [];
  $: fingersOnFret = fingers.filter(
    (finger) => typeof finger.fret === "number" && finger.fret > 0
  ) as { fret: number; line: number }[];
  $: noneFingers = fingers.filter(
    (finger) => !(typeof finger.fret === "number" && finger.fret > 0)
  ) as { fret: 0 | "open" | "mute"; line: number }[];

  export let inlayVisible: boolean = true;
</script>

<Canvas
  width={FRET_START * 2 + fretRangeWidth}
  height={STRING_START * 2 + STRING_GAP * 5}
>
  <Crop
    width={FRET_START * 2 + FRET_GAP * FRET_MAX}
    height={STRING_START * 2 + STRING_GAP * 5}
    sourceArea={{
      x: getXFromFretNumber(fretRange.start - fretNumberPadding),
      width: fretRangeWidth,
    }}
    destArea={{ x: FRET_START }}
  >
    <FingerBoardBackground {inlayVisible} />
    {#each fingersOnFret as finger}
      <Circle
        x={getXFromFretNumber(finger.fret - 0.5)}
        y={getYFromStringNumber(finger.line)}
        radius={FINGER_RADIUS}
      />
    {/each}
  </Crop>
  {#each noneFingers as noneFinger}
    <Text
      fontSize="20px"
      fontFamily="FinaleJazz"
      textAlign="left"
      textBaseline="middle"
      text={noneFinger.fret === "mute" ? "X" : "O"}
      x={getXFromFretNumber(-fretNumberPadding)}
      y={getYFromStringNumber(noneFinger.line)}
    />
  {/each}
  {#if fretRange.visibility === "all" || fretRange.visibility === "start"}
    <Text
      fontSize="20px"
      fontFamily="FinaleJazz"
      textAlign="center"
      textBaseline="bottom"
      text={`${fretRange.start}`}
      x={FRET_START + fretNumberPadding * FRET_GAP}
      y={STRING_START}
    />
  {/if}
  {#if fretRange.visibility === "all" || fretRange.visibility === "end"}
    <Text
      fontSize="20px"
      fontFamily="FinaleJazz"
      textAlign="center"
      textBaseline="bottom"
      text={`${fretRange.end}`}
      x={FRET_START + fretRangeWidth - fretNumberPadding * FRET_GAP}
      y={STRING_START}
    />
  {/if}
</Canvas>
