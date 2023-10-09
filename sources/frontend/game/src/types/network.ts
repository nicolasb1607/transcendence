import { blackHole } from "./GameDataTypes";
import type { user } from "./user";

enum GameType {
	classicPong = "classicPong",
	spatialPong = "spatialPong"
}

interface GameDB {
	ID: number;
	type: GameType
	players: number[];
	score: number[];
	createdAt: Date;
	updatedAt: Date;
	duration:number;
	winnerId:number;
}

/*
interface score {
	playersScore: number[];
}
*/

interface coords {
	x: number;
	y: number;
	z: number;
}

interface pads extends coords {
	isMovingUp: boolean;
	isMovingDown: boolean;
}

type updatePads = coords;

type ball = coords;

export interface GameData extends Pick<GameDB, "players"|"score"|"type"|"ID"|"createdAt"> {
	pads: pads[];
	ball: ball;
	blackhole: blackHole[];
	// score: score;
}

export interface GameUpdate extends Omit<GameData, "players"|"type|"|"pads"|"ID"> {
	pads: updatePads[];
}

export type FinalGameData = GameData & 
	Pick<GameDB, "winnerId"|"duration"> & {
		exp: number[];
		participants: user[];
	}


export type userInputKeys = "isMovingUp" | "isMovingDown" | 'none';

export interface UserInputDTO {
	isMovingUp: boolean;
	isMovingDown: boolean;
}
