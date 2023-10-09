import { Color, MeshBasicMaterial } from "three";

// PAD CONSTANTS
export const LEFT_PAD_KEY_UP = 'z';
export const LEFT_PAD_KEY_DOWN = 's';
export const RIGHT_PAD_KEY_UP = 'ArrowUp';
export const RIGHT_PAD_KEY_DOWN = 'ArrowDown';
export const PAD_SPEED_CLASSIC = 5;
export const PAD_SPEED_SPATIAL = 0.02;
export const DEFAULT_MATERIAL = new MeshBasicMaterial({ color: new Color(0xffffff) });
export const LEFT_PAD_NAME = 'leftPad';
export const RIGHT_PAD_NAME = 'rightPad';
export const PAD_WIDTH = 15;
export const PAD_HEIGHT = 100;

// INPUTEHANDLER CONSTANTS
export const REPEAT_SPEED = 1000/*ms*/ / 120/*fps*/;
export const DEFAULT_MOUSE_INFO = {
	x: 0,
	y: 0,
	xOnLeftClick: 0,
	yOnLeftClick: 0,
	xOnRightClick: 0,
	yOnRightClick: 0,
	xOnMiddleClick: 0,
	yOnMiddleClick: 0,
	leftButton: false,
	middleButton: false,
	rightButton: false,
	mouseWheel: 0
};

// GAMESCENE CONSTANTS
export const RENDER_PER_SECOND = 1000/*ms*/ / 60/*fps*/;
export const DEFAULT_BACKGROUND_COLOR = new Color(0x000000);
export const CAMERA_ROTATION_SPEED_X = 0.02;
export const CAMERA_ROTATION_SPEED_Y = 0.02;
export const CAMERA_MOVE_SPEED = 0.01;
export const CAMERA_ZOOM_SPEED = 0.8;
export const DEFAULT_BACKGROUND = 0x141828;

// ENVIRONNEMENT CONSTANTS
export const RING_X_MAX = 0.20;
export const RING_STEP = 0.0015;

// BALL CONSTANTS
export const BALL_RADIUS_CLASSIC = 10;
export const BALL_SPEED_X_RATIO = 0.01;
export const BALL_SPEED_Y_RATIO = 0.01;
export const BALL_SPEED_Z_RATIO = 0.01;

// COLLISION HANDLER CONSTANTS
export const SPATIAL_WALL_RADIUS = 132;
export const SPATIAL_PAD_RADIUS = 122;

// GAMELOGIC CONSTANTS
export const MAX_SCORE = 5;

// GAME CONSTANTS
export const CLASSIC_PONG_WIDTH = 800;
export const CLASSIC_PONG_HEIGHT = 600;

export const FADE_STEP = 0.66;