import { Mesh, Object3D } from 'three';
import { type GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import type { GameScene } from './GameScene';
import type { axisDirections } from '../types/utils';

import Blackhole from '../../assets/models/blackhole.glb';

type promiseResolve = () => void;

export class Environnement {

	private pads: Mesh[] = [];
	private blackhole!: Object3D;
	private whitehole!: Object3D;
	private largeRing:Object3D|undefined;
	private moveDirection:axisDirections = { x: 'up', y: 'up', z: 'up' };
	private	resolveInit:undefined|promiseResolve;
	
	constructor(
		private scene: GameScene,
	) {}
		
	public async init():Promise<void>{
		return (new Promise((resolve, reject) => {
			this.resolveInit = resolve;
			const gltfLoader = new GLTFLoader(this.scene.loadingManager);// gltfLoader.load(EnvironnementModel, this.loadModel.bind(this), this.loadProgress.bind(this), this.loadError.bind(this));
			gltfLoader.load(Blackhole, this.loadModel.bind(this), this.loadProgress.bind(this), this.loadError.bind(this));
		}));
	}

	// public getPads():Mesh[] {
	// 	return (this.pads);
	// }

	public getBlackhole(): Object3D {
		return (this.blackhole);
	}
	public getWhitehole(): Object3D {
		return (this.whitehole);
	}

	public update() {
		this.animateBlackhole();
	}

	public animateBlackhole() {
		if (!this.blackhole) return;
		this.blackhole.rotation.y -=  0.0075;
		if (this.blackhole.rotation.y >= Math.PI * 2) {
			this.blackhole.rotation.y = 0;
		}
		if (!this.whitehole) return;
		this.whitehole.rotation.y +=  0.0075;
		if (this.whitehole.rotation.y >= Math.PI * 2) {
			this.whitehole.rotation.y = 0;
		}
	}

	private loadModel(gltf: GLTF) {
		this.tweakModel(gltf);
		console.log('Environnement loaded');
		if (typeof this.resolveInit !== "undefined") {
			this.resolveInit();
		}
	}

	/**
	 * Add shadow to each mesh of the model
	 * Update mesh to use MeshPhongMaterial
	 * Add gradient to chevron_light
	 * Fix gate transparency
	 */
	private tweakModel(gltf: GLTF) {
		const baseWidth = 800;
		const baseHeight = 600;
		const canvas = this.scene.getCanvas()
		const scaledWidth = (canvas.clientWidth / baseWidth) * 25;
		const scaledHeight = (canvas.clientHeight / baseHeight) * 25;
		gltf.scene.scale.set(10 * scaledWidth, 10 * scaledHeight, 10 * scaledWidth);
		gltf.animations[0];
		gltf.scene.traverse((child) => {
			if (child.name === "Sketchfab_Scene") {
				this.blackhole = child.clone();
				this.blackhole.scale.set(0, 0, 0);
				this.blackhole.position.z = -50;
				this.blackhole.rotateX(Math.PI /2);
				this.blackhole.rotateY(Math.PI /2);
				this.whitehole = child.clone();
				this.whitehole.scale.set(0, 0, 0);
				this.whitehole.position.z = -50;
				this.whitehole.rotateX(Math.PI /2);
				this.whitehole.rotateY(Math.PI /2);
			};
		});
		gltf.scene.castShadow = false;
		gltf.scene.receiveShadow = false;
	}

	private loadProgress(xhr: ProgressEvent<EventTarget>) {
		if (xhr.lengthComputable) {
			const percentLoaded = (xhr.loaded / xhr.total) * 100;
			console.log(percentLoaded + '% loaded');
		}
	}

	private loadError(error: ErrorEvent) {
		console.error(error);
	}
}