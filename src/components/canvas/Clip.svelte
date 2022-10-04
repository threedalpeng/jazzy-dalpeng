<script lang="ts">
  import { onCanvasRender } from "./context";

  export let x: number;
  export let y: number;
  export let width: number;
  export let height: number;

  onCanvasRender(({ context2d: ctx }) => {
    ctx.clearRect(x, y, width, height);
  });
</script>
