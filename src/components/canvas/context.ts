import { getContext, onDestroy, setContext } from "svelte";
import type { Writable } from "svelte/store";

interface CanvasContext {
  getCanvas: () => HTMLCanvasElement;
  getContext2D: () => CanvasRenderingContext2D;
  getTimeDelta: () => number;
  subscribeRender: (callback: (props: CanvasContext) => any) => void;
  unsubscribeRender: (callback: (props: CanvasContext) => any) => void;
  width: Writable<number>;
  height: Writable<number>;
}

export const setCanvasContext = (context: CanvasContext) => {
  return setContext("canvas", context);
};
export const getCanvasContext: () => CanvasContext = () => {
  return getContext("canvas");
};
export const onCanvasRender = (renderFn: (props: CanvasContext) => any) => {
  const props = getCanvasContext();
  props.subscribeRender(renderFn);

  onDestroy(() => {
    props.unsubscribeRender(renderFn);
  });
};
