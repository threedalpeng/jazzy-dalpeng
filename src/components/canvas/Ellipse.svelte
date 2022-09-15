<script lang="ts">
  import { onCanvasRender } from "./context";

  export let x: number;
  export let y: number;
  export let radiusX: number;
  export let radiusY: number;
  export let rotation: number = 0;
  export let startAngle: number = 0;
  export let endAngle: number = 2 * Math.PI;
  export let counterclockwise: boolean = false;
  export let fillStyle: string | CanvasGradient | CanvasPattern = "#000";
  export let strokeStyle: string | CanvasGradient | CanvasPattern = "#000";
  export let lineWidth: number = 1;

  onCanvasRender(({ getContext2D }) => {
    const ctx = getContext2D();
    ctx.fillStyle = fillStyle;
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.ellipse(
      x,
      y,
      radiusX,
      radiusY,
      rotation,
      startAngle,
      endAngle,
      counterclockwise
    );
    ctx.stroke();
    ctx.fill();
  });
</script>
