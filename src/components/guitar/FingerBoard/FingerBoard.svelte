<script lang="ts">
  import { Canvas, Circle, Text } from "@canvas";
  import { setFingerBoardContext } from "./context";
  import FingerBoardBackground from "./FingerBoardBackground.svelte";

  export let fingers: { line: number; fret: number }[] = [];

  const { FRET_START, FRET_GAP, STRING_START, STRING_GAP, FINGER_RADIUS } =
    setFingerBoardContext();
</script>

<Canvas
  width={FRET_START * 2 + FRET_GAP * 13}
  height={STRING_START * 2 + STRING_GAP * 5}
>
  <FingerBoardBackground />
  {#each fingers as finger}
    <Circle
      x={FRET_START + (finger.fret - 0.5) * FRET_GAP}
      y={STRING_START + (6 - finger.line) * STRING_GAP}
      radius={FINGER_RADIUS}
    />
  {/each}
  <Text
    fontSize="16px"
    fontFamily="FinaleJazz"
    textAlign="center"
    textBaseline="bottom"
    text="0"
    x={FRET_START}
    y={STRING_START}
  />
</Canvas>
