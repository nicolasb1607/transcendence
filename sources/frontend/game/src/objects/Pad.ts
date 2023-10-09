import { BoxGeometry, MeshBasicMaterial, Mesh, type BufferGeometry, type Vector3, ColorRepresentation } from "three";

import { PAD_WIDTH, PAD_HEIGHT, CLASSIC_PONG_WIDTH, CLASSIC_PONG_HEIGHT } from "../GameConstants";

import type { mouseEventInfo, padSide, gameType } from "../types/GameDataTypes";
import type { GameScene } from "../display/GameScene";


export class Pad {

/* *************************** */
/*         ATTRIBUTES          */
/* *************************** */
	private name!: string;
	private pad!: BufferGeometry;
	private material!: MeshBasicMaterial;
	private mesh!: Mesh;
	private scene!: GameScene;
	private side: padSide;
	private movingUp: boolean = false;
	private movingDown: boolean = false;
	private typeOfPad: gameType;
	public id!: number;
	private pressedKeys: string[] = [];
	private ratioWidth: number;
	private ratioHeight: number;

/* *************************** */
/*         CONSTRUCTOR         */
/* *************************** */
	constructor(
		name: string,
		typeOfPad: gameType,
		color: ColorRepresentation,
		side: padSide,
		scene: GameScene
	) {

		this.side = side;
		this.name = name;
		this.material = new MeshBasicMaterial({color: color});
		this.typeOfPad = typeOfPad;
		this.scene = scene;
		this.ratioWidth = this.scene.getCanvas().clientWidth / CLASSIC_PONG_WIDTH;
		this.ratioHeight = this.scene.getCanvas().clientHeight / CLASSIC_PONG_HEIGHT;
		this.id = 0;
		this.initClassicPad();
		this.inputHandler = this.inputHandler.bind(this);
	}

/* *************************** */
/*           METHODS           */
/* *************************** */
	public initClassicPad(): void {
		const padWidth: number = PAD_WIDTH * this.ratioWidth;
		const padHeight: number = PAD_HEIGHT * this.ratioHeight;
		const halfWidth: number = this.scene.getCanvas().clientWidth / 2;

		this.pad = new BoxGeometry(padWidth, padHeight, 1);
		this.mesh = new Mesh(this.pad as BoxGeometry, this.material);
		this.mesh.position.x = (this.side === 'left')
		? -halfWidth + padWidth / 2
		: halfWidth - padWidth / 2;
	}
	
	public inputHandler(pressedKeys?: string[], _mouseInfo?: mouseEventInfo): void {
		// SET TYPE OF MOVEMENT DIPENDING ON THE TYPE OF PAD
		// USED TO KNOW IF PAD IS MOVING UP OR DOWN
		this.pressedKeys = pressedKeys || [];
	}

	public blink() {
		let count = 0;
		const blinkInterval = setInterval(() => {
				count % 2 == 0 ? this.scene.remove(this.mesh) : this.scene.add(this.mesh); 
				count += 1;
				if (count == 12) clearInterval(blinkInterval);
		}, 250);
	}

	public updatePosition(x: number, y: number, z: number): void {
		this.mesh.position.set(x * this.ratioWidth, y * this.ratioHeight, z);
	}

/* *************************** */
/*     GETTERS AND SETTERS     */
/* *************************** */
	public isMovingUp(): boolean {
		return this.movingUp;
	}

	public isMovingDown(): boolean {
		return this.movingDown;
	}

	public getMaterial(): MeshBasicMaterial {
		return this.material;
	}

	public getMesh(): Mesh {
		return this.mesh;
	}

	public getPosition(): Vector3 {
		return this.mesh.position;
	}

	public getAngle(): number {
		return this.mesh.rotation.z;
	}

	public getName(): string {
		return this.name;
	}

	public getTypeOfPad(): gameType {
		return this.typeOfPad;
	}

	public setName(name: string): void {
		this.name = name;
	}

	public setTypeOfPad(typeOfPad: gameType): void {
		this.typeOfPad = typeOfPad;
	}
 
	public setRatios(ratioWidth: number, ratioHeight: number): void {
		this.ratioWidth = ratioWidth;
		this.ratioHeight = ratioHeight;
	}
}