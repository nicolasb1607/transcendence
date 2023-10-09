/* eslint-disable @typescript-eslint/no-unused-vars */
type GameType = "classic" | "spatial"
type BackendGameType = "classicPong" | "spatialPong"
type ClassicGameType = "classic" | "custom"

interface Game {
	ID: number
    type: GameType
    players: number[]
    createdAt: Date
    updatedAt: Date
    duration: number
    winnerId: number
    score: number[]
}

interface BackendGame extends Omit<Game, "type"> {
	type: BackendGameType
}


interface LeveProgression {
	rank:string;
	color:string;
	logo:string;
}