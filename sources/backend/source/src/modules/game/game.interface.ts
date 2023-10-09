import type { Game, GameType } from "@prisma/client";
import type { UserDetails } from "../users/users.interface";
import type { statKey } from "../stats/stats.interface";

export interface Coords {
	x: number;
	y: number;
}



export interface circle extends Coords {
	radius: number;
}

interface pads extends Coords {
	isMovingUp: boolean;
	isMovingDown: boolean;
}

type updatePads = Coords;

type ball = Coords;

type GameStatistic = {
	[key in statKey]?: number;
}

export interface BlackHoleData {
	x?: number;
	y?: number;
	radius: number;
	hasSpawned: boolean;
	hasDisappear: boolean;
	isActive: boolean;
}

export interface GameData extends Pick<Game, "players"|"score"|"type"|"ID"|"createdAt"> {
	loadedPlayersStatus: boolean[];
	/**
	 * Determine if the challenger and the challenged are in the game
	 * page
	 */
	isChallengersReady?: boolean[];
	pads: pads[];
	ball: ball;
	blackHole: BlackHoleData[];
	stats: GameStatistic[];
	running: boolean;
}

export interface GameUpdate extends Omit<GameData, "players"|"type|"|"pads"|"ID"> {
	pads: updatePads[];
}

export type FinalGameData = GameData & 
	Pick<Game, "winnerId"|"duration"> & {
		exp: number[];
		participants: UserDetails[];
	}

export type userInputKeys = "isMovingUp" | "isMovingDown";

export type playerStatus = "inQueue" | "inGame" | undefined;

export interface playerInfo {
	status: playerStatus;
	type: GameType;
}

export interface userQueueInfo {
	type: GameType;
	user: UserDetails
}
