<script lang="ts">
  import { onCanvasRender } from "../context";

  export let points: { x: number; y: number }[];
  export let strokeStyle: string | CanvasGradient | CanvasPattern = "#000";
  export let lineCap: CanvasLineCap = "butt";
  export let lineWidth: number = 1;

  onCanvasRender(({ context2d: ctx }) => {
    ctx.strokeStyle = strokeStyle;
    ctx.lineCap = lineCap;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    const start = points[0];
    ctx.moveTo(start.x, start.y);
    points.slice(1).forEach((point) => {
      ctx.lineTo(point.x, point.y);
    });
    ctx.stroke();
  });
</script>
