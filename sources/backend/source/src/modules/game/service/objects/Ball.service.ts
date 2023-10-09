import { Injectable } from '@nestjs/common';
import { GameType } from "@prisma/client";

import type { Pad } from './Pad.service';
import { GameLogic } from '../logic/GameLogic.service';
import { CLASSIC_PONG_BALL_SPEED } from '../../game.constants';
import { GameData, type Coords } from '../../game.interface';

// HELPERS
function randomPlayerTurn() {
	return Math.random() < 0.5 ? -1 : 1;
}

function randomFloat() {
	return Math.random() * randomPlayerTurn();
}

@Injectable()
export class Ball {
	private x: number;
	private y: number;
	private slope: number;
	private directionX: number;
	private directionY: number;
	private radius: number;
	private speed: number;
	private maxSpeed = 0;
	private pads: Pad[];
	private logic: GameLogic;
	private gameType: string;
	private gameData: GameData;

	constructor(
		x: number,
		y: number,
		radius: number,
		pads: Pad[],
		logic: GameLogic,
		gameType: string,
		gameData: GameData
	) {
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.pads = pads;
		this.logic = logic;
		this.gameType = gameType;
		this.gameData = gameData;
	}

	public getPosition(): { x: number, y: number } {
		return { x: this.x, y: this.y };
	}

	public getSlope(): number {
		return (this.slope);
	}

	public getRadius(): number {
		return this.radius;
	}

	public getSpeed(): number {
		return this.speed;
	}

	public setSlope(slope: number): void {
		this.slope = slope;
	}
	public setSpeed(speed: number): void {
		this.speed = speed;
		if (this.speed > this.maxSpeed) {
			this.logic.saveGameSpeed(speed);
		}
	}

	public getDirection(): { x: number, y: number } {
		return { x: this.directionX, y: this.directionY };
	}

	public setDirection(direction: { x: number, y: number }): void {
		this.directionX = direction.x;
		this.directionY = direction.y;
	}

	public setBallNewCoords(newCoords: Coords) {
		this.x = newCoords.x;
		this.y = newCoords.y;
	}

	public startBouncing(): void {
		this.pads.forEach((pad) => {
			if (pad.getId() == this.logic.getPlayerTurn()) {
				if (pad.getPosition().x < 0) {
					this.directionX = -1;
				}
				else {
					this.directionX = 1;
				}
				this.directionY = randomFloat();
				this.setSpeed(CLASSIC_PONG_BALL_SPEED);
			}
		});
	}

	public updateBall() {
		this.x += this.directionX * this.speed;
		this.y += this.directionY * this.speed;
		if (this.gameType == GameType.classicPong)
		{
			this.gameData.ball.x = this.x;
			this.gameData.ball.y = this.y;
		}
		else {
			this.gameData.ball.x = this.x;
			this.gameData.ball.y = this.y;
		}
	}

	public stopBouncing(): void {
		this.x = 0;
		this.y = 0;
		this.gameData.ball.x = 0;
		this.gameData.ball.y = 0;
		this.directionX = 0;
		this.directionY = 0;
		this.speed = CLASSIC_PONG_BALL_SPEED;
	}
}
