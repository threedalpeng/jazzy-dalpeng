<script lang="ts">
  import { onCanvasRender } from "./context";

  type AngleUnit = "deg" | "grad" | "rad" | "trun";
  type Angle = `${number}${AngleUnit}`;

  type LengthUnit =
    | "%"
    | "ch"
    | "em"
    | "ex"
    | "ic"
    | "rem"
    | "vh"
    | "vw"
    | "vmax"
    | "vmin"
    | "vb"
    | "vi"
    | "px"
    | "cm"
    | "mm"
    | "Q"
    | "in"
    | "pc"
    | "pt";
  type Length = `${number}${LengthUnit}`;

  export let text: string;
  export let fontStyle: "normal" | "italic" | "oblique" | `oblique ${Angle}` =
    "normal";
  export let fontVariant: "normal" | "small-caps" = "normal";
  export let fontWeight: "normal" | "bold" | "lighter" | "bolder" | number =
    "normal";
  export let fontStretch:
    | "normal"
    | "ultra-condensed"
    | "extra-condensed"
    | "condensed"
    | "semi-condensed"
    | "semi-expanded"
    | "expanded"
    | "extra-expanded"
    | "ultra-expanded" = "normal";
  export let fontSize: Length = "10px";
  export let fontFamily: string = "sans-serif";

  export let textAlign: CanvasTextAlign = "start";
  export let textBaseline: CanvasTextBaseline = "alphabetic";

  export let fillStyle: string | CanvasGradient | CanvasPattern = "#000";
  export let strokeStyle: string | CanvasGradient | CanvasPattern = "#000";

  export let x: number;
  export let y: number;

  onCanvasRender(({ context2d: ctx }) => {
    const font = `${fontStyle} ${fontVariant} ${fontWeight} ${fontStretch} ${fontSize} ${fontFamily}`;
    ctx.font = font;
    ctx.textAlign = textAlign;
    ctx.textBaseline = textBaseline;
    ctx.fillStyle = fillStyle;
    ctx.strokeStyle = strokeStyle;

    ctx.fillText(text, x, y);
  });
</script>
