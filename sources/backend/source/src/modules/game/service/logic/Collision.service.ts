import { Injectable } from "@nestjs/common";
import { GameType } from "@prisma/client";

import type { Pad } from '../objects/Pad.service';
import { Ball } from '../objects/Ball.service';
import { GameLogic } from './GameLogic.service';

// CONSTANTS
import {
	CLASSIC_PONG_WIDTH,
	CLASSIC_PONG_PAD_WIDTH,
	CLASSIC_PONG_PAD_HEIGHT,
	CLASSIC_PONG_HEIGHT
} from '../../game.constants'

import type { BlackHole } from "../objects/BlackHole.service";

// HELPERS
function distanceBetweenPoints(point1: {x: number, y: number}, point2: {x: number, y: number}): number {
	return Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
}

@Injectable()
export class Collision {
	private pads: Pad[];
	private blackholes!: BlackHole[];
	private ball: Ball;
	private logic: GameLogic;
	private gameType: string;
	private HitBh: boolean;

	constructor(
		pads: Pad[],
		blackholes: BlackHole[],
		ball: Ball,
		gameLogic: GameLogic,
		gameType: string
	) {
		this.pads = pads;
		this.blackholes = blackholes;
		this.ball = ball;
		this.logic = gameLogic;
		this.gameType = gameType;
		this.HitBh = false;
	}

	public checkCollisions(): void {
		this.checkClassicPongCollision();
		if (this.gameType == GameType.spatialPong && this.blackholes[0].getActiveStatus() 
			&& !this.blackholes[0].getDisappearState()) {
			this.checkBhCollision();
		}
	}
	
	public checkBhCollision() {

		let collide = false;
		let out: number;
		if (distanceBetweenPoints(this.blackholes[0].getPosition(), this.ball.getPosition()) <= this.blackholes[0].getSize()) {
			collide = true;
			out = 1;
		}
		else if (distanceBetweenPoints(this.blackholes[1].getPosition(), this.ball.getPosition()) <= this.blackholes[1].getSize()) {
			collide = true;
			out = 0;
		}
		if (collide) {
			this.HitBh = true;
			this.ball.setBallNewCoords(this.blackholes[out].getPosition());
			this.ball.updateBall();
			this.blackholes[0].disable();
			this.blackholes[1].disable();
			const delayBeforeRepop = setInterval(() => {
				let state = false;
				if (state) {
					this.blackholes[0].setActiveStatus(false);
					this.blackholes[1].setActiveStatus(false);
					clearInterval(delayBeforeRepop);
				}
				state = true;
			}, 1000);
		}
	}

	public checkClassicPongCollision(): void {
		this.checkClassicPongCollisionWithWalls();
		this.checkClassicPongCollisionWithPads();
	}

	public checkClassicPongCollisionWithWalls(): void {
		if (this.ball.getPosition().y + this.ball.getRadius() >= CLASSIC_PONG_HEIGHT / 2
			|| this.ball.getPosition().y - this.ball.getRadius() <= -CLASSIC_PONG_HEIGHT / 2) {
			this.ball.setDirection({ x: this.ball.getDirection().x, y: this.ball.getDirection().y * -1});
		}
		if (this.ball.getPosition().x + this.ball.getRadius() >= CLASSIC_PONG_WIDTH / 2
			|| this.ball.getPosition().x - this.ball.getRadius() <= -CLASSIC_PONG_WIDTH / 2) {
			this.ball.stopBouncing();
			this.logic.increasePlayerScore(this.logic.getPreviousPlayerTurn());
			if (this.HitBh) {
				this.logic.increaseWormholeUse(this.logic.getPreviousPlayerTurn());
				this.HitBh = false;
			}
			this.pads[0].resetPosition();
			this.pads[1].resetPosition();
			setTimeout( () => {
				this.ball.startBouncing();
			}, 1000);
		}
	}

	public checkClassicPongCollisionWithPads(): void {
		const ballPosition = this.ball.getPosition();
		const ballRadius = this.ball.getRadius();
		const leftPadPosition = this.pads[0].getPosition();
		const leftPadTopCorner = {x: leftPadPosition.x + CLASSIC_PONG_PAD_WIDTH / 2, y: leftPadPosition.y + CLASSIC_PONG_PAD_HEIGHT / 2};
		const leftPadBotCorner = {x: leftPadPosition.x + CLASSIC_PONG_PAD_WIDTH / 2, y: leftPadPosition.y - CLASSIC_PONG_PAD_HEIGHT / 2};
		const rightPadPosition = this.pads[1].getPosition();
		const rightPadTopCorner = {x: rightPadPosition.x - CLASSIC_PONG_PAD_WIDTH / 2, y: rightPadPosition.y + CLASSIC_PONG_PAD_HEIGHT / 2};
		const rightPadBotCorner = {x: rightPadPosition.x - CLASSIC_PONG_PAD_WIDTH / 2, y: rightPadPosition.y - CLASSIC_PONG_PAD_HEIGHT / 2};
		const speedMultiplierRatio = 1.04;

		if (
			// LEFT PAD FRONTAL COLLISION
			(this.logic.getPlayerTurn() == this.pads[0].getId()
			&& ballPosition.x - ballRadius <= -(CLASSIC_PONG_WIDTH / 2) + CLASSIC_PONG_PAD_WIDTH
			&& ballPosition.y <= leftPadTopCorner.y
			&& ballPosition.y >= leftPadBotCorner.y)
			// LEFT PAD TOP CORNER COLLISION
			|| distanceBetweenPoints(ballPosition, leftPadTopCorner) - ballRadius <= 0
			// LEFT PAD BOT CORNER COLLISION
			|| distanceBetweenPoints(ballPosition, leftPadBotCorner) - ballRadius <= 0
			// CHECK FOR PLAYER TURN TO AVOID STUCKING THE BALL IN THE PAD
		) {
			if (this.ball.getDirection().y == 0 && this.pads[0].getIsMovingUp() || this.pads[0].getIsMovingDown()) {
				this.ball.setDirection({x: this.ball.getDirection().x, y: this.ball.getDirection().y + ((this.pads[1].getIsMovingUp() ? 0.2 : -0.2))});
			}
			else if (this.ball.getDirection().y != 0 && this.pads[0].getIsMovingUp() || this.pads[0].getIsMovingDown()) {
				this.ball.setDirection({x: this.ball.getDirection().x, y: this.ball.getDirection().y * (this.pads[0].getIsMovingUp() ? 1 : -1)});
			}
			this.ball.setDirection({ x: this.ball.getDirection().x * -1, y: this.ball.getDirection().y});
			this.logic.increasePlayerBounces(0);
			this.logic.changePlayerTurn();
			this.HitBh = false;
			if (this.ball.getSpeed() < CLASSIC_PONG_PAD_WIDTH * 2) {
				this.ball.setSpeed(this.ball.getSpeed() * speedMultiplierRatio);
			}
		}
		if (
			// RIGHT PAD FRONTAL COLLISION
			(this.logic.getPlayerTurn() == this.pads[1].getId()
			&& ballPosition.x + ballRadius >= CLASSIC_PONG_WIDTH / 2 - CLASSIC_PONG_PAD_WIDTH
			&& ballPosition.y <= rightPadTopCorner.y
			&& ballPosition.y >= rightPadBotCorner.y)
			// RIGHT PAD TOP CORNER COLLISION
			|| distanceBetweenPoints(ballPosition, rightPadTopCorner) - ballRadius <= 0
			// RIGHT PAD BOT CORNER COLLISION
			|| distanceBetweenPoints(ballPosition, rightPadBotCorner) - ballRadius <= 0
			// CHECK FOR PLAYER TURN TO AVOID STUCKING THE BALL IN THE PAD
		) {
			if (this.ball.getDirection().y == 0 && this.pads[1].getIsMovingUp() || this.pads[1].getIsMovingDown()) {
				this.ball.setDirection({x: this.ball.getDirection().x, y: this.ball.getDirection().y + ((this.pads[1].getIsMovingUp() ? 0.2 : -0.2))});
			}
			else if (this.ball.getDirection().y != 0 && this.pads[1].getIsMovingUp() || this.pads[1].getIsMovingDown()) {
				this.ball.setDirection({x: this.ball.getDirection().x, y: this.ball.getDirection().y * (this.pads[1].getIsMovingUp() ? 1 : -1)});
			}
			this.ball.setDirection({ x: this.ball.getDirection().x * -1, y: this.ball.getDirection().y});
			this.logic.increasePlayerBounces(1);
			this.HitBh = false;
			this.logic.changePlayerTurn();
			if (this.ball.getSpeed() < CLASSIC_PONG_PAD_WIDTH * 2) {
				this.ball.setSpeed(this.ball.getSpeed() * speedMultiplierRatio);
			}
		}
	}
}
