<script lang="ts">
  import Crop from "@/components/canvas/Crop.svelte";
  import { Canvas, Circle, Text } from "@canvas";
  import { getXFromFretNumber, setFingerBoardContext } from "./context";
  import FingerBoardBackground from "./elements/FingerBoardBackground.svelte";

  export let fretRange: {
    start: number;
    end: number;
    visibility: "none" | "all" | "start" | "end";
  } = {
    start: 3,
    end: 12,
    visibility: "start",
  };
  export let fingers: { line: number; fret: number }[] = [];
  export let inlayVisible: boolean = true;

  const {
    FRET_START,
    FRET_GAP,
    STRING_START,
    STRING_GAP,
    FINGER_RADIUS,
    FRET_MAX,
  } = setFingerBoardContext();
  const fretNumberPadding = 0.3;

  $: fretRangeGap = fretRange.end - fretRange.start;
  $: fretRangeWidth = FRET_GAP * (fretRangeGap + fretNumberPadding * 2);
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
    {#each fingers as finger}
      <Circle
        x={FRET_START + (finger.fret - 0.5) * FRET_GAP}
        y={STRING_START + (6 - finger.line) * STRING_GAP}
        radius={FINGER_RADIUS}
      />
    {/each}
  </Crop>
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
