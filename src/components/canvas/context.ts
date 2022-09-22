import { getContext, onDestroy, onMount, setContext } from "svelte";

type CanvasGetter = () => HTMLCanvasElement;
type CanvasRenderCallback = (props: CanvasContext) => any;
class CanvasContext {
  #canvasGetter: CanvasGetter;
  #renderCallbacks: CanvasRenderCallback[] = [];
  #timePassed = 0;
  #frameId = 0;
  constructor(canvasGetter: CanvasGetter) {
    this.#canvasGetter = canvasGetter;
  }

  get canvas() {
    return this.#canvasGetter();
  }
  get context2d() {
    return this.canvas.getContext("2d");
  }
  get delta() {
    return this.#timePassed;
  }

  get width() {
    return this.canvas.width;
  }
  set width(w) {
    this.canvas.width = w;
  }
  get height() {
    return this.canvas.height;
  }
  set height(h) {
    this.canvas.height = h;
  }

  subscribe(callback: CanvasRenderCallback) {
    this.#renderCallbacks = this.#renderCallbacks.concat(callback);
  }
  unsubscribe(callback: CanvasRenderCallback) {
    this.#renderCallbacks = this.#renderCallbacks.filter(
      (render) => render !== callback
    );
  }

  run() {
    const render: FrameRequestCallback = async (t) => {
      this.#timePassed = t;
      let ctx = this.context2d;
      ctx.clearRect(0, 0, this.width, this.height);
      this.#renderCallbacks.forEach(async (renderCallback) => {
        ctx.save();
        renderCallback(this);
        ctx.restore();
      });
      this.#frameId = requestAnimationFrame(render);
    };
    this.#frameId = requestAnimationFrame(render);
  }

  quit() {
    window.cancelAnimationFrame(this.#frameId);
  }
}

export const setCanvasContext = (canvasGetter: CanvasGetter) => {
  let context = setContext("canvas", new CanvasContext(canvasGetter));
  onMount(() => {
    context.run();
  });
  onDestroy(() => {
    context.quit();
  });
  return context;
};
export const getCanvasContext: () => CanvasContext = () => {
  return getContext("canvas");
};
export const onCanvasRender = (
  renderFn: (canvasContext: CanvasContext) => any
) => {
  const canvasContext = getCanvasContext();
  onMount(() => {
    canvasContext.subscribe(renderFn);
  });

  onDestroy(() => {
    canvasContext.unsubscribe(renderFn);
  });
};