// INPUTHANDLER TYPES
export type mouseEventInfo = {
	x: number,
	y: number,
	xOnLeftClick: number,
	yOnLeftClick: number,
	xOnRightClick: number,
	yOnRightClick: number,
	xOnMiddleClick: number,
	yOnMiddleClick: number,
	leftButton: boolean,
	middleButton: boolean,
	rightButton: boolean,
	mouseWheel: number
};

export type handler = (pressedKeys?: string[], mouseInfo?: mouseEventInfo) => void;

// PAD TYPES
export type padSide = 'left' | 'right';
export type gameType = 'classic' | 'spatial';