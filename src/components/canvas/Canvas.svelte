<script lang="ts">
  import { setContext, onMount, onDestroy } from "svelte";

  import { writable } from "svelte/store";
  import { setCanvasContext } from "./context";

  let canvas: HTMLCanvasElement;
  let t: number;
  export let width = 100;
  export let height = 100;
  let renderCallbacks = [];
  let wrapper;

  let reactiveWidth = writable(width);
  let reactiveHeight = writable(height);

  const props = {
    getCanvas: () => {
      return canvas;
    },
    getContext2D: () => {
      return canvas.getContext("2d");
    },
    getTimeDelta: () => {
      return t;
    },
    subscribeRender: (callback) => {
      renderCallbacks = renderCallbacks.concat(callback);
    },
    unsubscribeRender: (callback) => {
      renderCallbacks = renderCallbacks.filter((render) => render !== callback);
    },
    width: reactiveWidth,
    height: reactiveHeight,
  };
  setCanvasContext(props);

  let isSlotChecked = false;

  let frameId: number;
  const render = () => {
    const loop: FrameRequestCallback = (t) => {
      let ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, $reactiveWidth, $reactiveHeight);
      renderCallbacks.forEach((render) => {
        ctx.save();
        render(props);
        ctx.restore();
      });
      frameId = requestAnimationFrame(loop);
    };
    frameId = requestAnimationFrame(loop);
  };
  onMount(() => {
    render();
  });
  onDestroy(() => {
    window.cancelAnimationFrame(frameId);
  });
</script>

<canvas
  bind:this={canvas}
  class="w-screen object-contain object-center md:w-auto"
  width={$reactiveWidth}
  height={$reactiveHeight}
/>
{#if canvas}
  <slot />
{/if}
