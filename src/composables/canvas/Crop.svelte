<script lang="ts">
  import type { Rect } from "@/types/geometry";
  import { getCanvasContext, setSubroutineCanvasContext } from "./context";

  export let width: number;
  export let height: number;
  export let sourceArea: Partial<Rect> = { x: 0, y: 0 };
  export let destArea: Partial<Rect> = { x: 0, y: 0 };

  /* Outer Context */
  const upperCanvasContext = getCanvasContext();

  /* Inner Context */
  const offscreenCanvas = document.createElement("canvas");
  offscreenCanvas.width = width;
  offscreenCanvas.height = height;
  setSubroutineCanvasContext(upperCanvasContext, () => offscreenCanvas, {
    afterRender: ({ canvas }) => {
      upperCanvasContext.context2d.drawImage(
        canvas,
        sourceArea.x ?? 0,
        sourceArea.y ?? 0,
        sourceArea.width ?? canvas.width,
        sourceArea.height ?? canvas.height,
        destArea.x ?? 0,
        destArea.y ?? 0,
        destArea.width ?? sourceArea.width ?? canvas.width,
        destArea.height ?? sourceArea.height ?? canvas.height
      );
    },
  });
</script>

{#if offscreenCanvas}
  <slot />
{/if}
