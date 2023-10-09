import { Injectable } from '@nestjs/common';
import { GameData } from '../../game.interface';
import { GameStatsService } from '../gameStats.service';

function randomInteger(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

@Injectable()
export class GameLogic {

	private playersScore: number[] = [];
	private numberOfPlayers = 2;
	private playerTurn = 0;
	private playerBounces: number[] = [];
	private gameData: GameData;
	private gameStats: GameStatsService = new GameStatsService();

	constructor(
		numberOfPlayers = 2,
		gameData: GameData
	) {
		this.numberOfPlayers = numberOfPlayers;
		this.gameData = gameData;
	}

	public getGameData(): GameData {
		return (this.gameData);
	}

	public getNumberOfPlayers(): number {
		return this.numberOfPlayers;
	}

	public getPlayerScore(playerId: number): number {
		return this.playersScore[playerId];
	}

	public getPlayerTurn(): number {
		return this.playerTurn;
	}

	public getPreviousPlayerTurn(): number {
		return (this.playerTurn - 1 + this.numberOfPlayers) % this.numberOfPlayers;
	}

	public getPlayerBounces(playerId: number): number {
		return this.playerBounces[playerId];
	}

	public resetScore(): void {
		this.playersScore = [];
		for (let i = 0; i < this.numberOfPlayers; i++) {
			this.playersScore[i] = 0;
		}
	}

	public resetPlayerTurn(): void {
		this.playerTurn = randomInteger(0, this.numberOfPlayers - 1);
	}

	public resetPlayerBounces(): void {
		for (let i = 0; i < this.numberOfPlayers; i++) {
			this.playerBounces[i] = 0;
		}
	}

	public resetGame(): void {
		this.resetScore();
		this.resetPlayerTurn();
		this.resetPlayerBounces();
	}

	public increasePlayerScore(playerId: number): void {
		this.playersScore[playerId]++;
		this.gameData.score[playerId]++;
	}

	public increasePlayerBounces(playerIndex: number): void {
		this.playerBounces[playerIndex]++;
		this.gameStats.updateGameStats(this.gameData, playerIndex, "bounce", 1);
	}

	public increaseWormholeUse(playerIndex: number): void {
		this.gameStats.updateGameStats(this.gameData, playerIndex, "wormhole", 1);
	}

	public saveGameSpeed(gameSpeed:number): void {
		this.gameData.players.forEach((playerId, playerIndex) => {
			this.gameStats.updateGameStats(this.gameData, playerIndex, "max_game_speed", Math.floor(gameSpeed));
		});
	}

	public changePlayerTurn(): void {
		this.playerTurn = (this.playerTurn + 1) % this.numberOfPlayers;
	}
}