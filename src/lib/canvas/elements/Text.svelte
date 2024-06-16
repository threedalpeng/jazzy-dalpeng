<script lang="ts">
	import { onCanvasRender } from '../core/hooks';
	import HitRegion, { type ForwardHitRegionProps } from './HitRegion.svelte';

	interface TextProps {
		text: string;
		x: number;
		y: number;

		fontStyle?: CanvasFontStyle;
		fontVariant?: CanvasFontVariant;
		fontWeight?: CanvasFontWeight;
		fontStretch?: CanvasFontStretch;
		fontSize?: CanvasLength;
		fontFamily?: string;

		textAlign?: CanvasTextAlign;
		textBaseline?: CanvasTextBaseline;

		fillStyle?: CanvasStyle;
		strokeStyle?: CanvasStyle;
	}

	const {
		text,
		x,
		y,
		fontStyle = 'normal',
		fontVariant = 'normal',
		fontWeight = 'normal',
		fontStretch = 'normal',
		fontSize = '10px',
		fontFamily = 'sans-serif',
		textAlign = 'start',
		textBaseline = 'alphabetic',
		fillStyle = '#000',
		strokeStyle = '#000',
		active = false,
		...rest
	}: TextProps & ForwardHitRegionProps = $props();

	const render = (ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) => {
		const font = `${fontStyle} ${fontVariant} ${fontWeight} ${fontStretch} ${fontSize} ${fontFamily}`;
		ctx.font = font;
		ctx.textAlign = textAlign;
		ctx.textBaseline = textBaseline;

		ctx.fillText(text, x, y);
	};

	onCanvasRender(({ context2d: ctx }) => {
		ctx.fillStyle = fillStyle;
		ctx.strokeStyle = strokeStyle;
		render(ctx);
	});
</script>

<HitRegion {active} {render} {...rest}></HitRegion>
