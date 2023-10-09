import { Color, type OrthographicCamera, PerspectiveCamera, Scene, WebGLRenderer, ACESFilmicToneMapping, type Camera, type Light, LoadingManager } from 'three';
// import type { mouseEventInfo } from './GameTypes';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { getSunLight, getAmbientLight } from './lights';
import { GUI } from 'dat.gui';
import { Pad } from '../objects/Pad';
import { Environnement } from './Environnement';
import type { coords } from '../types/utils';
import { Ball } from '../objects/Ball';
import { DEFAULT_BACKGROUND } from '../GameConstants';
import SoundManager from '../userInterface/SoundManager';
import LoadingScreen from '../userInterface/LoadingScreen';
// import { BlackHole } from '../objects/BlackHole';
import { gameTheme } from '../types/theme';

import bannerSvg from '../../assets/image/banner.svg';
import { BlackHole } from '../objects/BlackHole';

export interface GameSceneOptions {
	camera: OrthographicCamera | PerspectiveCamera;
	cameraPosition?: coords;
	background?: number;
	loadGUI?: boolean;
	orbitControls?: boolean;
	/**
	 * The size of the canvas
	 * If not defined, the canvas will be the size of the window
	 */
	canvasSize?: {
		width: number;
		height: number;
	}
	updatePixelRatio?: boolean;
	backgroundMusic?: boolean;
	theme?: gameTheme;
}
type gameObject = Pad | Light | Environnement | Ball | BlackHole;

export class GameScene extends Scene {

	private objects: Map<string, gameObject> = new Map<string, gameObject>();
	private camera!: Camera;
	public renderer: WebGLRenderer = new WebGLRenderer();
	private canvas: HTMLCanvasElement = document.querySelector('#game-scene') as HTMLCanvasElement;
	private orbitControls: OrbitControls|null = null;
	private gui!: GUI;
	private SoundManager:SoundManager|undefined;
	public gameSceneOpts: GameSceneOptions;
	public loadingManager:LoadingManager = new LoadingManager();
	public loadingScreen!:LoadingScreen;

	private animateId: NodeJS.Timeout | null = null;

	constructor(gameSceneOpts: GameSceneOptions) {
		super();
		this.loadingScreen = new LoadingScreen(this.loadingManager);
		this.gameSceneOpts = gameSceneOpts;
		this.initGameScene();
	}

	/**
	 * initialize the game scene
	 */
	private initGameScene(): void {
		// set the canvas size
		this.updateWindowSize();
		this.camera = this.gameSceneOpts.camera;
		this.initRenderer();
		this.loadLights();
		this.loadGUI();
		this.handleTheme();
		this.animate = this.animate.bind(this);
		if (this.gameSceneOpts?.backgroundMusic) {
			this.SoundManager = new SoundManager(this.camera);
		}
	}

	private handleTheme() {
		if (!this.gameSceneOpts?.theme?.theme?.background){
			this.background = new Color(this.gameSceneOpts?.background || DEFAULT_BACKGROUND);
		} else if (this.canvas && this.gameSceneOpts?.theme){
			const theme = this.gameSceneOpts?.theme?.theme;
			const backgroundImageAndUrl = [];
			if (theme.backgroundImage)
				backgroundImageAndUrl.push(`url(${theme.backgroundImage}) no-repeat center center / 60%`);
			if (theme.background)
				backgroundImageAndUrl.push(theme.background);
			if (backgroundImageAndUrl.length > 0)
				this.canvas.style.background = backgroundImageAndUrl.join(',');
			if  (theme.backgroundStyle)
				Object.assign(this.canvas.style, theme.backgroundStyle);
			if (theme.coalitionImage) { 
				const banner = document.createElement('div');
				const logo = document.createElement('img');
				banner.classList.add('banner');
				banner.style.backgroundImage = `url(${bannerSvg})`;
				//import svg and replace fill
				logo.src = theme.coalitionImage;
				logo.classList.add('logo');
				banner.appendChild(logo);
				this.canvas.parentElement?.appendChild(banner);
			}
			if (this.gameSceneOpts?.theme.name === 'Spatial')
			{
				let i = 0;
				this.canvas.style.backgroundRepeat = 'repeat';
				this.canvas.style.backgroundSize = 'cover';
				setInterval(() => {
					this.canvas.style.backgroundPosition = `${i}px ${i}px`;
					i++;
				}, 1000/15);
			}
		}
	}

	/**
	 * If the canvas size is not defined, the canvas will be the size of the window
	 * else the canvas size will be the size defined in the gameSceneOpts
	 */
	private updateWindowSize() {
		if (this.gameSceneOpts.canvasSize) {
			this.canvas.width = this.gameSceneOpts.canvasSize.width;
			this.canvas.height = this.gameSceneOpts.canvasSize.height;
		} else {
			this.canvas.width = window.innerWidth;
			this.canvas.height = window.innerHeight;
		}
	}

	private initRenderer() {
		const themeHasBackground = this.gameSceneOpts?.theme?.theme?.background;
		this.renderer = new WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: Boolean(themeHasBackground)});
		if (themeHasBackground) {
			this.renderer.setClearColor(0x000000, 0);
		}
		this.renderer.setSize(this.canvas.width, this.canvas.height);
		if (this.gameSceneOpts.updatePixelRatio) {
			this.renderer.setPixelRatio( window.devicePixelRatio );
		}
		this.renderer.shadowMap.enabled = true;
		this.renderer.toneMapping = ACESFilmicToneMapping;
		this.renderer.toneMappingExposure = 1;
	}

	private loadLights() {
		const ambientLight = getAmbientLight();
		const sunLight = getSunLight({ x: -20, y: 300, z: -20 });
		if (ambientLight){
			this.objects.set('ambientLight', ambientLight);
			this.add(ambientLight);
		}
		if (sunLight){
			this.objects.set('sunLight', sunLight);
			this.add(sunLight);
		}
	}

	private loadGUI() {
		if (!this.gameSceneOpts?.loadGUI) return;
		this.gui = new GUI();
		const ambiantLight = this.objects.get('ambientLight');
		const sunLight = this.objects.get('sunLight');
		let lightFolder, cameraFolder;
		
		if (this.camera instanceof PerspectiveCamera) {
			cameraFolder = this.gui.addFolder('Camera');
			cameraFolder.add(this.camera.position, 'x', -1000, 1000);
			cameraFolder.add(this.camera.position, 'y', -1000, 1000);
			cameraFolder.add(this.camera.position, 'z', -1000, 1000);
			cameraFolder.add(this.camera.rotation, 'x', -10, 10);
			cameraFolder.add(this.camera.rotation, 'y', -10, 10);
			cameraFolder.add(this.camera.rotation, 'z', -10, 10);
		}

		
		if (ambiantLight || sunLight) {
			lightFolder = this.gui.addFolder('Light');
			if (ambiantLight) {
				lightFolder.add(ambiantLight as Light, 'intensity', 0, 1);
			}
			if (sunLight) {
				lightFolder.add(sunLight as Light, 'intensity', 0, 1);
			}
		}
		this.destroyGUIonClose();
	}

	private loadObjects() {
		this.objects.forEach((object) => {
			if (object instanceof Pad || object instanceof Ball && !(this.children.includes(object.getMesh())))
				this.add(object.getMesh())
		});
	}

	/**
	 * When page change, the GUI is destroyed
	 * @see https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Proxy
	 */
	private destroyGUIonClose(){
		console.log("gui",this.gui)
		if (this.gui.closed === false){
			window.history.pushState = new Proxy(window.history.pushState, {
				apply: (target, thisArg, argArray) => {
					this.gui.close();
					this.gui.destroy();
					window.history.pushState = target;//remove proxy
					//@ts-ignore
					return (target.apply(thisArg, argArray));
				},
			});
		}
	}
	
	// PUBLIC METHODS
	
	/**
	 * Add an object to the scene
	 */
	public addObject(name: string, object: gameObject) {
		this.objects.set(name, object);
		console.log("object === ", this.objects);
		if (object instanceof Ball || object instanceof Pad || object instanceof BlackHole) {
			console.log("OBJ ===", object)
			this.loadObjects();
		}
	}

	/**
	 * Remove an object from the scene
	 */
	public removeObject(name: string) {
		this.objects.delete(name);
	}

	/**
	 * The animate function is called repeatedly to render the scene (default 60fps)
	 */
	public animate() {
		this.objects.forEach((object) => {
			if ("update" in object) {
				object.update();
			}
		});
		this.renderer.render(this, this.camera);
		requestAnimationFrame(this.animate);
	}
	/**
	 * start rendering the scene (RENDER_PER_SECOND is the times per second the scene is rendered)
	 */
	public startRendering(): void {
		if (this.animateId == null) {
			this.animateId = setInterval(() => {
				this.objects.forEach((object) => {
					if ("update" in object) {
						object.update();
					}
				});
				this.renderer.render(this, this.camera);
			}, 1000/60);
		}
	}

	/**
	 * stop rendering the scene
	 */
	public stopRendering(): void {
		if (this.animateId != null) {
			clearInterval(this.animateId);
			this.animateId = null;
		}
	}

	// GETTERS AND SETTERS

	/**
	 * get the camera
	 */
	public getCamera(): Camera {
		return this.camera;
	}

	public getSoundManager(): SoundManager|null {
		return (this?.SoundManager || null);
	}

	/**
	 * set the camera
	 */
	public setCamera(camera: Camera): void {
		this.camera = camera;
	}

	/**
	 * get the canvas
	 */
	public getCanvas(): HTMLCanvasElement {
		return this.canvas;
	}

	/**
	 * set the canvas
	 */
	public setCanvas(canvas: HTMLCanvasElement): void {
		this.canvas = canvas;
		this.initGameScene();
	}

	public getObjects():Map<string, gameObject> {
		return this.objects;
	}

	public getOrbitControls(): OrbitControls|null {
		return this?.orbitControls;
	}

	public getGUI(): GUI {
		return this.gui;
	}

}
