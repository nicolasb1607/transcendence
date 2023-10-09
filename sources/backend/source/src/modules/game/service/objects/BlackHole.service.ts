import { Injectable } from '@nestjs/common';
import { getRandomValues } from "crypto";

@Injectable()
export class BlackHole {

	private x!: number;
	private y!: number;
	private z:number;
	private radius: number;
	private hasSpawned: boolean;
	private isActive: boolean;
	private hasDisappear: boolean;

	constructor(radius: number) {
		this.radius = radius;
		this.hasSpawned = false;
		this.hasDisappear = false;
		this.isActive = false;
	}

	public getSize(): number {
		return this.radius;
	}

	//return data for GameData
	public getData() {
		return ({
			radius:this.radius,
			x: this.x,
			y: this.y,
			hasSpawned: this.hasSpawned,
			hasDisappear: this.hasDisappear,
			isActive: this.isActive
		})
	}

	public getPosition():{x:number, y:number} {
		return ({x: this.x, y: this.y});
	}

	public getStatus(): boolean {
		return this.hasSpawned;
	}

	public getActiveStatus(): boolean {
		return (this.isActive);
	}

	public disable(): void {
		this.hasSpawned = false;
		this.hasDisappear = true;
		this.isActive = false;
	}

	public getDisappearState(): boolean {
		return (this.hasDisappear);
	}

	public setDisappears(): void {
		this.hasDisappear = true;
	}

	public setActiveStatus(state: boolean) {
		this.isActive = state;
	}

	public spawn(index: number): void {
		const side = (Math.random() < 0.5) ? 1 : -1
		if (index == 0) {
			const rand = getRandomValues(new Uint32Array(2))
			this.x = rand[0] * -side % 350;
			this.y = rand[1] * -side % 250;
		}
		else if (index == 1) {
			this.x = Math.floor(Math.random() * (300 - 50) + 50) * side;
			this.y = Math.floor(Math.random() * (200 - 50) + 50) * side;
		}
		this.z = -50;
		console.log("BH coords: ", this.x, this.y, this.z);
		this.hasSpawned = true;
		this.hasDisappear = false;
		const activate = setInterval(() => {
			this.isActive = true;
			clearInterval(activate);
		}, 1000);
	}

	public generateBlackHole(type: number) {
		if (Math.floor(Math.random() * (10 * 30)) == 1) {
			console.log("BH generated");
			this.spawn(type);
		}
	}
}