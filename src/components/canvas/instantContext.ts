import { getContext, onDestroy, onMount, setContext } from "svelte";

type CanvasRenderCallback = (props: CanvasContext) => any;
class CanvasContext {
  #canvas: HTMLCanvasElement;
  #renderCallbacks: CanvasRenderCallback[];
  #timePassed = 0;
  #frameId = 0;
  #width = 100;
  #height = 100;
  constructor(canvas: HTMLCanvasElement) {
    this.#canvas = canvas;
  }

  get canvas() {
    return this.#canvas;
  }
  get context2d() {
    return this.#canvas.getContext("2d");
  }
  get delta() {
    return this.#timePassed;
  }

  get width() {
    return this.#width;
  }
  set width(w) {
    this.#width = w;
    this.resize();
  }
  get height() {
    return this.#height;
  }
  set height(h) {
    this.#height = h;
    this.resize();
  }

  subscribe(callback: CanvasRenderCallback) {
    this.#renderCallbacks = this.#renderCallbacks.concat(callback);
  }
  unsubscribe(callback: CanvasRenderCallback) {
    this.#renderCallbacks = this.#renderCallbacks.filter(
      (render) => render !== callback
    );
  }

  resize() {
    this.#canvas.width = this.#width;
    this.#canvas.height = this.#height;
  }

  run() {
    const render: FrameRequestCallback = (t) => {
      this.#timePassed = t;
      let ctx = this.context2d;
      ctx.clearRect(0, 0, this.#width, this.#height);
      this.#renderCallbacks.forEach((renderCallback) => {
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

export const setCanvasContext = (canvas: HTMLCanvasElement) => {
  const context = new CanvasContext(canvas);

  onMount(() => {
    context.run();
  });
  onDestroy(() => {
    context.quit();
  });
  return setContext("canvas", context);
};
export const getCanvasContext: () => CanvasContext = () => {
  return getContext("canvas");
};
export const onCanvasRender = (renderFn: (props: CanvasContext) => any) => {
  const props = getCanvasContext();
  props.subscribe(renderFn);

  onDestroy(() => {
    props.unsubscribe(renderFn);
  });
};
