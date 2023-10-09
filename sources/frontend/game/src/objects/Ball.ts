import { SphereGeometry, MeshBasicMaterial, Mesh, DoubleSide, type Vector3, ColorRepresentation } from "three";

import { BALL_RADIUS_CLASSIC, CLASSIC_PONG_WIDTH, CLASSIC_PONG_HEIGHT} from "../GameConstants";
import { coords } from "../types/utils";

import type { gameType } from "../types/GameDataTypes";

export class Ball {

/* *************************** */
/*         ATTRIBUTES          */
/* *************************** */
	private ball!: SphereGeometry;
	private ballMaterial!: MeshBasicMaterial;
	private ballMesh!: Mesh;
	private ballRadius!: number;
	private mode!: gameType;
	public direction!: coords;
	public ballSpeed!: number;
	private ratioWidth!: number;
	private ratioHeight!: number;

/* *************************** */
/*         CONSTRUCTOR         */
/* *************************** */
	constructor(mode: gameType, color?:ColorRepresentation) {
		this.mode = mode;
		this.direction = {x: 0, y: 0, z: 0}
		this.initBall(color);
	}

/* *************************** */
/*           METHODS           */
/* *************************** */
	private initBall(color?:ColorRepresentation): void {
		const canvas = document.getElementById('game-scene') as HTMLCanvasElement;
		const radius = (this.mode === 'classic') ? BALL_RADIUS_CLASSIC : BALL_RADIUS_CLASSIC;

		this.ratioWidth = canvas.clientWidth / CLASSIC_PONG_WIDTH;
		this.ratioHeight = canvas.clientHeight / CLASSIC_PONG_HEIGHT;
		this.ballSpeed = 1;
		this.ballRadius = radius * this.ratioHeight;
		this.ball = new SphereGeometry(this.ballRadius);
		this.ballMaterial = new MeshBasicMaterial({
			color: color || 0xffffff, side: DoubleSide
		});
		this.ballMesh = new Mesh(this.ball, this.ballMaterial);
	}

	public updatePosition(x: number, y: number, z: number): void {
		if (this.mode === 'classic') {
			this.ballMesh.position.set(x * this.ratioWidth, y * this.ratioHeight, z);
		}
		else {
			this.ballMesh.position.set(x * this.ratioWidth, y * this.ratioHeight, z);
		}
	}

	public fadeIn() {
		let size: number = 0;
		const step = this.ballRadius / 30;
		const fadeHole = () => {
			if (size <= this.ballRadius)
				return;
			this.ballMesh.scale.set(size, size, size);
			size += step;
			setTimeout(fadeHole, 1000 / 30);
		}
		fadeHole();
	};

	public fadeOut() {
		const step = this.ballRadius / 30;
		let size: number = this.ballRadius;
		const fadeHole = () => {
			if (size >= 0)
				return;
			this.ballMesh.scale.set(size, size, size);
			size -= step;
			setTimeout(fadeHole, 1000 / 30);
		}
		fadeHole();
	}

/* *************************** */
/*     GETTERS AND SETTERS     */
/* *************************** */
	public getMaterial(): MeshBasicMaterial {
		return this.ballMaterial;
	}

	public getMesh(): Mesh {
		return this.ballMesh;
	}

	public getPosition(): Vector3 {
		return this.ballMesh.position;
	}

	public getRadius(): number {
		return this.ballRadius;
	}

	public setMaterial(ballMaterial: MeshBasicMaterial): void {
		this.ballMaterial = ballMaterial;
		this.ballMesh = new Mesh(this.ball, this.ballMaterial);
	}

	public setRatios(ratioWidth: number, ratioHeight: number): void {
		this.ratioWidth = ratioWidth;
		this.ratioHeight = ratioHeight;
	}
}