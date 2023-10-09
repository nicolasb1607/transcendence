export interface coords {
	x: number
	y: number
	z: number
}

export type moveDirection = 'up' | 'down';

export interface axisDirections {
	x: moveDirection;
	y: moveDirection;
	z: moveDirection;
}

export interface CameraParams {
	left: number,
	right: number,
	top: number,
	bottom: number,
	near: number,
	far: number,
}