<script lang="ts">
  import Canvas from "./canvas/Canvas.svelte";
  import Circle from "./canvas/Circle.svelte";
  import Line from "./canvas/Line.svelte";
  import Text from "./canvas/Text.svelte";

  export let fingers: { line: number; fret: number }[] = [];

  const FRET_START = 30;
  const STRING_START = 30;
  const FRET_GAP = 50;
  const STRING_GAP = 30;
  const FRET_WIDTH = 4;
  const STRING_WIDTH = 1;
  const FINGER_RADIUS = 7;
  const INLAY_RADIUS = 3;
  const INLAY_STROKE_STYLE = "#555";
  const INLAY_FILL_STYLE = "#eee";

  const stringLines: { x: number; y: number }[][] = [];
  for (let i = 0; i < 6; i++) {
    stringLines.push([
      { x: FRET_START - 2, y: STRING_START + STRING_GAP * i },
      { x: FRET_START + FRET_GAP * 13, y: STRING_START + STRING_GAP * i },
    ]);
  }
  const fretLines: { x: number; y: number }[][] = [];
  for (let i = 0; i < 13; i++) {
    fretLines.push([
      { x: FRET_START + FRET_GAP * i, y: STRING_START },
      { x: FRET_START + FRET_GAP * i, y: STRING_START + STRING_GAP * 5 },
    ]);
  }
</script>

<Canvas
  width={FRET_START * 2 + FRET_GAP * 13}
  height={STRING_START * 2 + STRING_GAP * 5}
>
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
  <Circle
    x={FRET_START + 4.5 * FRET_GAP}
    y={STRING_START + 2.5 * STRING_GAP}
    radius={INLAY_RADIUS}
    strokeStyle={INLAY_STROKE_STYLE}
    fillStyle={INLAY_FILL_STYLE}
    lineWidth={2}
  />
  <Circle
    x={FRET_START + 6.5 * FRET_GAP}
    y={STRING_START + 2.5 * STRING_GAP}
    radius={INLAY_RADIUS}
    strokeStyle={INLAY_STROKE_STYLE}
    fillStyle={INLAY_FILL_STYLE}
    lineWidth={2}
  />
  <Circle
    x={FRET_START + 8.5 * FRET_GAP}
    y={STRING_START + 2.5 * STRING_GAP}
    radius={INLAY_RADIUS}
    strokeStyle={INLAY_STROKE_STYLE}
    fillStyle={INLAY_FILL_STYLE}
    lineWidth={2}
  />
  <Circle
    x={FRET_START + 11.5 * FRET_GAP}
    y={STRING_START + 1.5 * STRING_GAP}
    radius={INLAY_RADIUS}
    strokeStyle={INLAY_STROKE_STYLE}
    fillStyle={INLAY_FILL_STYLE}
    lineWidth={2}
  />
  <Circle
    x={FRET_START + 11.5 * FRET_GAP}
    y={STRING_START + 3.5 * STRING_GAP}
    radius={INLAY_RADIUS}
    strokeStyle={INLAY_STROKE_STYLE}
    fillStyle={INLAY_FILL_STYLE}
    lineWidth={2}
  />
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
