export interface Point {
	x: number;
	y: number;
}

export interface Size {
	width: number;
	height: number;
}

export type Rect = Point & Size;
