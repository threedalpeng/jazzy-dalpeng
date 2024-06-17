export type CanvasStyle = string | CanvasGradient | CanvasPattern;

export type CanvasAngleUnit = 'deg' | 'grad' | 'rad' | 'trun';
export type CanvasAngle = `${number}${CanvasAngleUnit}`;

export type CanvasLengthUnit =
	| '%'
	| 'ch'
	| 'em'
	| 'ex'
	| 'ic'
	| 'rem'
	| 'vh'
	| 'vw'
	| 'vmax'
	| 'vmin'
	| 'vb'
	| 'vi'
	| 'px'
	| 'cm'
	| 'mm'
	| 'Q'
	| 'in'
	| 'pc'
	| 'pt';
export type CanvasLength = `${number}${CanvasLengthUnit}` | 0;

export type CanvasFontStyle = 'normal' | 'italic' | 'oblique' | `oblique ${CanvasAngle}`;
export type CanvasFontVariant = 'normal' | 'small-caps';
export type CanvasFontWeight = 'normal' | 'bold' | 'lighter' | 'bolder' | number;
export type CanvasFontStretch =
	| 'normal'
	| 'ultra-condensed'
	| 'extra-condensed'
	| 'condensed'
	| 'semi-condensed'
	| 'semi-expanded'
	| 'expanded'
	| 'extra-expanded'
	| 'ultra-expanded';
