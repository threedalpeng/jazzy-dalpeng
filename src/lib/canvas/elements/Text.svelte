<script lang="ts">
	import { onCanvasRender } from '../core/hooks';
	import HitRegion from './HitRegion.svelte';

	export let active: boolean = false;
	export let text: string;
	export let fontStyle: CanvasFontStyle = 'normal';
	export let fontVariant: CanvasFontVariant = 'normal';
	export let fontWeight: CanvasFontWeight = 'normal';
	export let fontStretch: CanvasFontStretch = 'normal';
	export let fontSize: CanvasLength = '10px';
	export let fontFamily: string = 'sans-serif';

	export let textAlign: CanvasTextAlign = 'start';
	export let textBaseline: CanvasTextBaseline = 'alphabetic';

	export let fillStyle: CanvasStyle = '#000';
	export let strokeStyle: CanvasStyle = '#000';

	export let x: number;
	export let y: number;

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

<HitRegion {active} {render} on:up on:down on:move on:click on:over on:out></HitRegion>
