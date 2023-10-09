import { Injectable } from '@nestjs/common';
import { GameData } from '../../game.interface';
import type { UserInputDTO } from '../../game.dto';
import { CLASSIC_PONG_HEIGHT, CLASSIC_PONG_PAD_HEIGHT } from '../../game.constants';

@Injectable()
export class Pad {
	private x: number;
	private y: number;
	private width: number;
	private height: number;
	private speed: number;
	private id: number;
	private isMovingUp = false;
	private isMovingDown = false;
	private gameData: GameData;

	constructor(
		x: number,
		y: number,
		width: number,
		height: number,
		speed: number,
		id: number,
		gameData: GameData
	) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.speed = speed;
		this.id = id;
		this.gameData = gameData;
		this.gameData.pads[this.id] = {
			x: this.x,
			y: this.y,
			isMovingUp: this.isMovingUp,
			isMovingDown: this.isMovingDown
		}
	}

	public getPosition(): { x: number, y: number } {
		return { x: this.x, y: this.y };
	}

	public getWidth(): number {
		return this.width;
	}

	public getHeight(): number {
		return this.height;
	}

	public getSpeed(): number {
		return this.speed;
	}

	public getId(): number {
		return this.id;
	}

	public getIsMovingUp(): boolean {
		return this.isMovingUp;
	}

	public getIsMovingDown(): boolean {
		return this.isMovingDown;
	}

	public moveUp(): void {
		if (this.y + CLASSIC_PONG_PAD_HEIGHT / 2 < CLASSIC_PONG_HEIGHT / 2) {
			this.y += this.speed;
			this.gameData.pads[this.id].y = this.y;
		}
	}

	public moveDown(): void {
		if (this.y - CLASSIC_PONG_PAD_HEIGHT / 2 > -CLASSIC_PONG_HEIGHT / 2) {
			this.y -= this.speed;
			this.gameData.pads[this.id].y = this.y;
		}
	}

	public updatePadPosition(): void {
		this.gameData.pads[this.id].x = this.x;
		this.gameData.pads[this.id].y = this.y;
		if (this.isMovingUp) {
			this.moveUp();
		}
		if (this.isMovingDown) {
			this.moveDown();
		}
	}

	public updatePlayerInput(userInput: UserInputDTO): void {
		this.isMovingUp = userInput.isMovingUp;
		this.isMovingDown = userInput.isMovingDown;
		if (userInput.isMovingUp) {
			this.moveUp();
		}
		if (userInput.isMovingDown) {
			this.moveDown();
		}
	}

	public resetPosition(): void {
		if (this.gameData.type == 'classicPong') {
			this.y = 0;
		}
		else {
			if (this.id == 0) this.y = 0;
			if (this.id == 1) this.y = Math.PI;
		}
	}
}