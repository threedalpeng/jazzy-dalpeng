<script lang="ts">
  import { Circle } from "@canvas";
  import { getFingerBoardContext } from "./context";

  const {
    FRET_START,
    FRET_GAP,
    STRING_START,
    STRING_GAP,
    INLAY_RADIUS,
    INLAY_STROKE_STYLE,
    INLAY_FILL_STYLE,
  } = getFingerBoardContext();
</script>

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
