type CanvasStyle = string | CanvasGradient | CanvasPattern;

type CanvasAngleUnit = 'deg' | 'grad' | 'rad' | 'trun';
type CanvasAngle = `${number}${CanvasAngleUnit}`;

type CanvasLengthUnit =
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
type CanvasLength = `${number}${CanvasLengthUnit}` | 0;

type CanvasFontStyle = 'normal' | 'italic' | 'oblique' | `oblique ${CanvasAngle}`;
type CanvasFontVariant = 'normal' | 'small-caps';
type CanvasFontWeight = 'normal' | 'bold' | 'lighter' | 'bolder' | number;
type CanvasFontStretch =
	| 'normal'
	| 'ultra-condensed'
	| 'extra-condensed'
	| 'condensed'
	| 'semi-condensed'
	| 'semi-expanded'
	| 'expanded'
	| 'extra-expanded'
	| 'ultra-expanded';
