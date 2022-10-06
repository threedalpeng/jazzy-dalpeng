<script lang="ts">
  import Ellipse from "./Ellipse.svelte";

  export let x: number;
  export let y: number;
  export let radius: number;
  export let fillStyle: string | CanvasGradient | CanvasPattern = "#000";
  export let strokeStyle: string | CanvasGradient | CanvasPattern = "#000";
  export let lineWidth: number = 1;
</script>

<Ellipse
  {x}
  {y}
  radiusX={radius}
  radiusY={radius}
  {fillStyle}
  {strokeStyle}
  {lineWidth}
/>
