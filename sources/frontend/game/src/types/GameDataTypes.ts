import { OrthographicCamera } from "three";
import { gameTheme } from "./theme";

enum GameType {
	classicPong = "classicPong",
	spatialPong = "spatialPong"
}

export interface coords {
	x: number;
	y: number;
	z: number;
}

export interface pads extends coords {
	isMovingUp: boolean;
	isMovingDown: boolean;
}

export interface blackHole extends coords{
	hasSpawned: boolean;
	hasDisappear: boolean;
}

export interface GameData extends Pick<GameDB, "players"|"score"|"type"|"ID"|"createdAt"> {
	pads: pads[];
	ball: ball;
	blackHole: blackHole[];
	startDate?: Date;
}

export interface GameUpdate extends Omit<GameData, "players"|"type|"|"pads"|"ID"> {
	pads: coords[];
}

export interface GameDB {
	ID: number;
	type: gameType
	players: number[];
	score: number[];
	createdAt: Date;
	updatedAt: Date;
	duration:number;
	winnerId:number;
}

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

export interface gameListener {
	sendPlayerInput: (event: KeyboardEvent) => void;
	stopSendingPlayerInput: (event: KeyboardEvent) => void;
	outOfFocus: () => void;
}

export interface GameSceneProps {
	canvasSize: {width: number, height: number},
	camera: OrthographicCamera,
	theme?: gameTheme,
	background?: number,
}
export type ball = coords;

export type handler = (pressedKeys?: string[], mouseInfo?: mouseEventInfo) => void;

// PAD TYPES
export type padSide = 'left' | 'right';
export type gameType = 'classic' | 'spatial';

export type promiseResolve = () => void;
export type bhState = "appears" | "disappears";