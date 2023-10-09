import { ForbiddenException, Injectable, Logger, NotFoundException, Scope } from "@nestjs/common";
import type { Game, GameType, UserStatus } from "@prisma/client";
import type { GameData, playerInfo, userQueueInfo } from "../game.interface";
import type { UserDetails, UserId } from '../../users/users.interface';
import type { UserInputDTO } from "../game.dto"; 
import { PrismaService } from '../../../common/providers/prisma/prisma.service';
import { ClassicPong } from "./logic/classicPong.service";
import { SpatialPong } from "./logic/spatialPong.service";
import { CLASSIC_PONG_PAD_WIDTH, CLASSIC_PONG_SCORE_LIMIT, CLASSIC_PONG_WIDTH, START_DELAY } from "../game.constants";
import { UsersService } from "../../users/users.service";
import { GameStatsService } from "./gameStats.service";
import { StatsService } from "../../stats/stats.service";
import { EventEmitter2 } from "@nestjs/event-emitter";

//TODO positionner au bon endroit
const defaultPad = {
	x: -(CLASSIC_PONG_WIDTH / 2) + CLASSIC_PONG_PAD_WIDTH / 2,
	y: 0,
	z: 0,
	isMovingUp: false,
	isMovingDown: false,
}

const defaultBall = {
	x: (CLASSIC_PONG_WIDTH / 2) - CLASSIC_PONG_PAD_WIDTH / 2,
	y: 0,
	z: 0,
}

const defaultBlackHole = {
	radius: 15,
	hasSpawned: false,
	hasDisappear: false,
	isActive: false,
}

const TICK_RATE = 1000 / 60;

@Injectable({ scope: Scope.DEFAULT })
export class GameService {

	queue: Map<GameType, UserDetails[]> = new Map();
	//List of playing games key is the game id
	games: Map<number, GameData> = new Map();
	// List of the instances of games logic (aka the itself)
	gameLogic: Map<number, ClassicPong | SpatialPong> = new Map();
	endingGames: number[] = [];

	constructor(
		private readonly logger: Logger,
		private readonly prisma: PrismaService,
		private readonly userService: UsersService,
		private readonly gameStats: GameStatsService,
		private readonly userStats: StatsService,
		private readonly eventEmitter: EventEmitter2
	) {
		this.initQueues();
		this.gameLoop();
	}
	
	public initQueues() {
		this.queue.set("classicPong", []);
		this.queue.set("spatialPong", []);
	}

	private gameLoop():void {
		setInterval(() => {
			for (const [gameId, game] of this.games) {
				if (!game.running || this.endingGames.includes(gameId)) continue;
				const newGameData = this.updateGame(gameId, game);
				if (newGameData) this.sendGameUpdateToPlayers(gameId, newGameData);
			}
		}, TICK_RATE);
	}

	private updateGame(gameId:number, game:GameData):GameData|null {
		const currentGame = this.gameLogic.get(gameId);
		const currentGameData = this.games.get(gameId);
		if (currentGameData.score.includes(CLASSIC_PONG_SCORE_LIMIT)) {
			this.games.set(gameId, currentGameData);
			this.endGame(gameId);
			return (null);
		}

		if (this.gameLogic.get(gameId) == undefined) return (null);

		this.games.set(gameId, this.gameLogic.get(gameId).getGameData());
		currentGame.setGameData(game);
		currentGame.collision.checkCollisions();
		currentGame.ball.updateBall();
		currentGame.pads.forEach(pad => pad.updatePadPosition());
		
		if (currentGame instanceof SpatialPong && !currentGame.blackhole[0].getStatus() && !currentGame.blackhole[0].getActiveStatus()) {
			currentGame.blackhole[0].generateBlackHole(0);
			if (currentGame.blackhole[0].getStatus()) {
				currentGame.blackhole[1].spawn(1);
			}
		}
		
		const gameData = currentGame.getGameData();
		if (currentGame instanceof SpatialPong) {
			gameData.blackHole.forEach((blackHole, index) => {
				gameData.blackHole[index] = currentGame.blackhole[index].getData();
			})
		}
		this.games.set(gameId, gameData);
		return (gameData);
	}

	private sendGameUpdateToPlayers(gameId:number, game:GameData) {
		const newGame = { ...game };
		for (const pads of newGame.pads) {
			delete pads.isMovingDown;
			delete pads.isMovingUp;
		}
		delete newGame.ID;
		delete newGame.type;
		delete newGame.createdAt;
		this.eventEmitter.emit("gameUpdate", gameId, newGame);
	}

	public joinChallengeGame(userId:number, gameId:number) {
		const game = this.games.get(gameId);
		if (!game) throw new NotFoundException(`Game ${gameId} not found`);
		if (!game.players.includes(userId)) throw new ForbiddenException(`Your are not allowed to join this game`);
		const playerIndex = game.players.indexOf(userId);
		game.isChallengersReady[playerIndex] = true;
		this.games.set(gameId, game);
		if (game.isChallengersReady.includes(false)) return;
		this.logger.debug(`Challenge Game ${game.ID} is starting`);
		this.eventEmitter.emit("initGame", game);
	}

	/**
	 * Insert user in the queue.
	 * If user is already in the queue, remove him from the queue and add him again
	 */
	public pushToQueue(user:UserDetails, type:GameType) {
		if (!this.queue.has(type)) throw new NotFoundException(`Game queue ${type} not found`);
		if (this.getPlayerInQueue(user.ID)) this.removeFromAllQueues(user.ID);
		this.queue.set(type, [...this.queue.get(type), user]);
		this.handleQueue(type);
	}

	public disconnectUser(userId:number) {
		const playerStatus = this.getPlayerStatus(userId);
		switch (playerStatus?.status) {
		case 'inQueue':
			this.removeFromQueue(userId, playerStatus.type);
			break;
		case 'inGame':
			this.userLooseConnection(userId);
			break;
		}
	}

	public removeFromQueue(userId:number, type:GameType) {
		this.logger.log(`${userId} is leaving queue`);
		const queue = this.queue.get(type);
		const index = queue.findIndex((u) => u.ID === userId);
		if (index === -1) return;
		queue.splice(index, 1);
	}

	public removeFromAllQueues(userId:number) {
		this.removeFromQueue(userId, "classicPong");
		this.removeFromQueue(userId, "spatialPong");
	}

	public getPlayerInQueue(userId:number):userQueueInfo|null {
		for (const [type, queue] of this.queue) {
			const index = queue.findIndex((u) => u.ID === userId);
			if (index !== -1) return ({ type, user: queue[index] });
		}
		return (null);
	}

	private handleQueue(type:GameType) {
		const queue = this.queue.get(type);
		if (queue.length < 2) return;
		this.logger.log(`Game ${type} is starting with ${queue[0].ID} and ${queue[1].ID}`);
		const player1 = queue.shift();
		const player2 = queue.shift();
		this.initGame(player1, player2, type);
	}

	public	getPlayerStatus(playerId:number):playerInfo|undefined {
		const inQueue = this.getPlayerInQueue(playerId);
		if (inQueue) return ({ status: "inQueue", type: inQueue.type });
		const game = this.getGameByPlayer(playerId);
		if (game) return ({ status: "inGame", type: game.type })
		return (undefined);
	}

	private getGameByPlayer(playerId:number):GameData|null {
		for (const [, game] of this.games) {
			if (game.players.includes(playerId)) {
				// console.log(game);
				return (game);
			}
		}
		return (null);
	}

	private async createGame(players:number[], type:GameType) {
		const newGame = await this.prisma.game.create({
			data: {
				players,
				type,
				winnerId: 0
			}
		});
		return (newGame);
	}

	private async initGame(player1:UserId|UserDetails, player2:UserId|UserDetails, type:GameType) {
		const players = [player1.ID, player2.ID];
		const game = await this.createGame(players, type);
		this.games.set(game.ID, {
			players,
			type,
			score: game.score,
			ID: game.ID,
			loadedPlayersStatus: [ false, false ],
			pads: [ defaultPad, defaultPad ],
			ball: defaultBall,
			blackHole: [ defaultBlackHole, defaultBlackHole ],
			createdAt: game.createdAt,
			running: false,
			stats: []
		});
		this.eventEmitter.emit("initGame", this.games.get(game.ID));
	}

	public async initChallengeGame(
		challenger:number,
		challenged:number,
		type:GameType
	):Promise<Game> {
		const players = [challenger, challenged];
		const game = await this.createGame(players, type);
		this.games.set(game.ID, {
			players,
			type,
			score: game.score,
			ID: game.ID,
			loadedPlayersStatus: [ false, false ],
			isChallengersReady: [ false, false ],
			pads: [ defaultPad, defaultPad ],
			ball: defaultBall,
			blackHole: [defaultBlackHole, defaultBlackHole],
			createdAt: game.createdAt,
			running: false,
			stats: []
		});
		this.logger.log(`Game ${game.ID} created for ${challenger} and ${challenged}`);
		return (game);
	}

	private initGameByType(gameType: GameType, gameId: number) {
		const game = this.games.get(gameId);
		const startDate = new Date(new Date().getTime() + START_DELAY);
		this.eventEmitter.emit("gameReady", gameId, startDate);
		const startGameInterval = setInterval(() => {
			game.running = true;
			this.games.set(gameId, game);
			clearInterval(startGameInterval);
		}, START_DELAY + 300);
		switch (gameType) {
		case "classicPong":
			this.gameLogic.set(gameId, new ClassicPong(game));
			break;
		case "spatialPong":
			this.gameLogic.set(gameId, new SpatialPong(game));
			break;
		default:
			throw new NotFoundException(`Game type ${gameType} not found`);
		}
		console.log("gameLogic update users status")
		this.updatePlayersStatus(game.players, 'inGame');
	}

	/**
	 * Return duration of the game in second, since createdAt
	 */
	private getGameActualDuration(gameId:number, game?:GameData):number {
		game = game || this.games.get(gameId);
		if (!game) throw new NotFoundException(`Game not found`);
		return (Math.floor((Date.now() - game.createdAt.getTime()) / 1000));
	}

	private getGameWinner(gameId:number, game?:GameData):number {
		game = game || this.games.get(gameId);
		if (!game) throw new NotFoundException(`Game not found`);
		return (game.score[0] > game.score[1] ? game.players[0] : game.players[1]);
	}

	private saveGameStats(gameId:number, game:GameData) {
		game.players.forEach(playerId => {
			const hasWin = this.getGameWinner(gameId, game) === playerId;
			const playerIndex = game.players.indexOf(playerId);
			this.gameStats.updateGameStats(game, playerIndex, "play_time", this.getGameActualDuration(gameId, game));
			this.gameStats.updateGameStats(game, playerIndex, hasWin ? "win" : "loose", 1);
			this.gameStats.updateGameStats(game, playerIndex, game.type === "classicPong" ? "classic_pong" : "spatial_pong", 1);
			this.gameStats.updateGameStats(game, playerIndex, "score", game.score[playerIndex]);
		});
	}

	private endGame(gameId:number, winnerId?:number) {
		const game = this.games.get(gameId);
		if (!game) throw new NotFoundException(`Game not found`);
		this.endingGames.push(game.ID);
		this.logger.log(`Game ${gameId} ended`);
		this.games.delete(gameId);
		this.updatePlayersStatus(game.players, 'online');
		this.saveGameStats(gameId, game);
		this.saveEndGame(gameId, game, winnerId);
	}

	public handleUserInput(playerId:number, userInput:UserInputDTO) {
		const game = this.getGameByPlayer(playerId);
		if (!game) throw new NotFoundException(`Game not found for player ${playerId}`);
		const gameLogic = this.gameLogic.get(game.ID);
		if (!gameLogic) return;
		//@todo update pad position
		gameLogic.updatePlayerInput(playerId, userInput);
	}

	public handleUserLoaded(playerId:number) {
		const game = this.getGameByPlayer(playerId);
		this.logger.log(`Player ${playerId} is ready on game ${game.ID}`);
		if (!game) throw new NotFoundException(`Game not found for player ${playerId}`);
		game.loadedPlayersStatus[playerId === game.players[0] ? 0 : 1] = true;
		if (!game.loadedPlayersStatus.includes(false)) {
			this.logger.log(`Game ${game.ID} is starting, both players are ready`);
			this.initGameByType(game.type, game.ID);
		}
	}

	public userLooseConnection(playerId:number) {
		const game = this.getGameByPlayer(playerId);
		if (!game) throw new NotFoundException(`Game not found for player ${playerId}`);
		if (this.endingGames.includes(game.ID)) return;
		this.logger.log(`Player ${playerId} loose connection on game ${game.ID}`);
		const otherPlayer = game.players.filter(player => player != playerId)?.[0] || undefined;
		this.endGame(game.ID, otherPlayer);
	}

	/**
	 * Save the game in the database duration, score, winnerId
	 * @param winnerId Id of the winner. If provided, 
	 * it means the other player surrendered
	 */
	public async saveEndGame(gameId:number, game:GameData, winnerId?:number) {
		const duration = this.getGameActualDuration(gameId, game);
		const usersExp: number[] = [];
		winnerId = winnerId || this.getGameWinner(gameId, game);

		await this.prisma.game.update({
			where: {
				ID: gameId
			},
			data: {
				score: game.score,
				duration,
				winnerId
			}
		});
		usersExp[0] = await this.userService.updateUserExperience(game.players[0], game.score[0], game.score[1]);
		usersExp[1] = await this.userService.updateUserExperience(game.players[1], game.score[1], game.score[0]);
		this.eventEmitter.emit("endGame", gameId, {
			...game,
			duration,
			winnerId,
			exp: usersExp,
			participants: await this.userService.getUsersByIds(game.players, true) as UserDetails[]
		});
		game.players.forEach((playerId) => {
			const userIndex = game.players.indexOf(playerId);
			this.userStats.bulkAddStats(playerId, gameId, game.stats[userIndex]);
			this.eventEmitter.emit("user.session.update", playerId);
		});
	}

	public updatePlayersStatus(players:number[], status: UserStatus) {
		players.forEach((playerId) => {
			this.userService.updateUserStatus(playerId, status);
		});
	}
}
