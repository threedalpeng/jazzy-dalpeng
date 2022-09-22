import { getContext, setContext } from "svelte";

interface FingerBoardContext {
  FRET_START: number;
  STRING_START: number;
  FRET_GAP: number;
  STRING_GAP: number;
  FRET_WIDTH: number;
  STRING_WIDTH: number;
  FINGER_RADIUS: number;
  INLAY_RADIUS: number;
  INLAY_STROKE_STYLE: string;
  INLAY_FILL_STYLE: string;
}

export const setFingerBoardContext = (
  context?: Partial<FingerBoardContext>
) => {
  const defaultContext: FingerBoardContext = {
    FRET_START: 30,
    STRING_START: 30,
    FRET_GAP: 50,
    STRING_GAP: 30,
    FRET_WIDTH: 4,
    STRING_WIDTH: 1,
    FINGER_RADIUS: 7,
    INLAY_RADIUS: 3,
    INLAY_STROKE_STYLE: "#555",
    INLAY_FILL_STYLE: "#eee",
  };
  if (context) Object.assign(defaultContext, context);
  return setContext<FingerBoardContext>("fingerboard", defaultContext);
};

export const getFingerBoardContext = () =>
  getContext<FingerBoardContext>("fingerboard");
