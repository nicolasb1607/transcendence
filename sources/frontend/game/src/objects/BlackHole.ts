import { SphereGeometry, MeshBasicMaterial, Mesh, DoubleSide, Vector3, Object3D, Box3 } from "three";

import { CLASSIC_PONG_WIDTH, CLASSIC_PONG_HEIGHT,  FADE_STEP } from "../GameConstants";

import type { GameScene } from "../display/GameScene";
import type { GameLogic } from "../logic/GameLogic";

import { Environnement } from "../display/Environnement";
import { coords } from "../types/utils";


export class BlackHole {

/* *************************** */
/*         ATTRIBUTES          */
/* *************************** */	
	public blackholeElement!:Object3D;
	private blackhole!: SphereGeometry;
	private blackholeMaterial!: MeshBasicMaterial;
	private blackholeMesh!: Mesh;
	private blackholeRadius!: number;
	private logic!: GameLogic;
	private gameScene!: GameScene;
	private x!: number;
	private y!: number;
	private activated: boolean;
	private ratioWidth = 1;
	private ratioHeight = 1;
	private holeSize!: Box3;

/* *************************** */
/*         CONSTRUCTOR         */
/* *************************** */
	constructor(gameScene: GameScene, index: number) {
		this.gameScene = gameScene;
		this.ratioWidth = gameScene.getCanvas().clientWidth / CLASSIC_PONG_WIDTH;
		this.ratioHeight = gameScene.getCanvas().clientHeight / CLASSIC_PONG_HEIGHT;
		this.activated = false;
		this.initBlackhole(index);
		this.holeSize = new Box3().setFromObject(this.blackholeElement)
	}

/* *************************** */
/*           METHODS           */
/* *************************** */	

	public initBlackhole(index: number): void {
		const objects = this.gameScene.getObjects();
		const env = objects.get('environnement') as Environnement;
		if (env) {
			this.blackholeElement = (index === 0) ? env.getBlackhole() : env.getWhitehole();
			this.holeSize = new Box3().setFromObject(this.blackholeElement);
		}
	}

	public traverseAndTint(tintColor: number) {
		this.blackholeElement.traverse((child) => {
		  if (child instanceof Mesh) {
			if (child.material) {
			  child.material.color.set(tintColor);
			}
		  }
		});
	}

	public fadeIn() {
		let size: number = 0;
		this.gameScene.add(this.blackholeElement);
		const fadeHole = () => {
			if (size >= 10) {
				return;
			}
			this.blackholeElement?.scale.set(size * window.devicePixelRatio, size * window.devicePixelRatio, size * window.devicePixelRatio);
			size += FADE_STEP*2;
			setTimeout(fadeHole, 1000 / 30);
		}
		fadeHole();
	}

	public fadeOut() {
		let size: number = 10;
		const fadeHole = () => {
			if (size <= 0) {
				this.gameScene.remove(this.getMesh());
				this.gameScene.remove(this.blackholeElement);
				return;
			}
			this.blackholeElement?.scale.set(size, size, size);
			size -= FADE_STEP*2;
			setTimeout(fadeHole, 1000 / 30);
		}
		fadeHole();
	}

/* *************************** */
/*     GETTERS AND SETTERS     */
/* *************************** */
	public getMaterial(): MeshBasicMaterial {
		return this.blackholeMaterial;
	}

	public getMesh(): Mesh {
		return this.blackholeMesh;
	}

	public getPosition(): coords {
		const pos: coords = {
			x: this.holeSize.max.x - this.holeSize.min.x,
			y: this.holeSize.max.y - this.holeSize.min.y,
			z: this.holeSize.max.z - this.holeSize.min.z
		}
		return (pos);
	}

	public getRadius(): number {
		return this.blackholeRadius;
	}

	public isActive(): boolean {
		return (this.activated);
	}

	public setState(state: boolean): void {
		this.activated = state;
	}

	public disableHole(): void {
		this.activated = false;
	}

	public setMaterial(blackholeMaterial: MeshBasicMaterial): void {
		this.blackholeMaterial = blackholeMaterial;
		this.blackholeMesh = new Mesh(this.blackhole, this.blackholeMaterial);
	}

	public setRatios(ratioWidth: number, ratioHeight: number): void {
		this.ratioWidth = ratioWidth;
		this.ratioHeight = ratioHeight;
	}

	public setCoords(x: number, y: number) {
		if (!this.blackholeElement) return;
		this.x = x * this.ratioWidth;
		this.y = y * this.ratioHeight;
		this.blackholeElement.position.x = x * this.ratioWidth;
		this.blackholeElement.position.y = y * this.ratioHeight;
		this.blackholeElement.position.z = -50;
	}
}