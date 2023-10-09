import { Injectable } from '@nestjs/common';
import { GameType } from "@prisma/client";
import { Pad } from '../objects/Pad.service';
import { Ball } from '../objects/Ball.service';
import { GameLogic } from './GameLogic.service';
import { Collision } from '../logic/Collision.service';
import { GameData } from '../../game.interface';
import type { UserInputDTO } from '../../game.dto';

// CONSTANTS
import {
	CLASSIC_PONG_WIDTH,
	CLASSIC_PONG_PAD_WIDTH,
	CLASSIC_PONG_PAD_HEIGHT,
	CLASSIC_PONG_PAD_SPEED,
	CLASSIC_PONG_BALL_RADIUS,
} from '../../game.constants'
import type { BlackHole } from '../objects/BlackHole.service';

@Injectable()
export class ClassicPong {

	private gameLogic: GameLogic;
	private gameData: GameData;
	public pads: Pad[] = [];
	public ball: Ball;
	public collision: Collision;
	public blackhole: BlackHole[];

	constructor(gameData: GameData) {

		this.gameData = gameData;

		this.gameLogic = new GameLogic(2, this.gameData);

		this.pads[0] = new Pad(
			-(CLASSIC_PONG_WIDTH / 2) + CLASSIC_PONG_PAD_WIDTH / 2, 0,
			CLASSIC_PONG_PAD_WIDTH, CLASSIC_PONG_PAD_HEIGHT, CLASSIC_PONG_PAD_SPEED,
			0, this.gameData
		);
		this.pads[1] = new Pad(
			(CLASSIC_PONG_WIDTH / 2) - CLASSIC_PONG_PAD_WIDTH / 2, 0,
			CLASSIC_PONG_PAD_WIDTH, CLASSIC_PONG_PAD_HEIGHT, CLASSIC_PONG_PAD_SPEED,
			1, this.gameData
		);

		this.ball = new Ball(
			0, 0, CLASSIC_PONG_BALL_RADIUS, this.pads,
			this.gameLogic, GameType.classicPong, this.gameData
		);

		this.collision = new Collision(
			this.pads, this.blackhole, this.ball, this.gameLogic,
			GameType.classicPong
		);
		this.ball.startBouncing();
	}

	public updatePlayerInput(playerId: number, userInput: UserInputDTO) {
		if (this.gameData.players[0] == playerId) this.pads[0].updatePlayerInput(userInput);
		if (this.gameData.players[1] == playerId) this.pads[1].updatePlayerInput(userInput);
	}

	public setGameData(gameData: GameData) {
		this.gameData = gameData;
	}

	public getGameData(): GameData {
		return this.gameData;
	}
}