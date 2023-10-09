import { BoxGeometry, Color, LineDashedMaterial, Mesh, OrthographicCamera } from "three";

import { BALL_RADIUS_CLASSIC, CLASSIC_PONG_HEIGHT, CLASSIC_PONG_WIDTH, DEFAULT_BACKGROUND, PAD_HEIGHT, PAD_WIDTH } from "../../GameConstants";
import { CameraParams } from "../../types/utils";
import { GameSceneProps, bhState, gameType } from "../../types/GameDataTypes";
import { Game } from "./game.class";
import { handleTheme } from "../../themes/getTheme";
import { gameTheme } from "../../types/theme";
import { Environnement } from "../../display/Environnement";
import { BlackHole } from "../../objects/BlackHole";
import { GameData } from "../../types/GameDataTypes";


export class SpatialPong extends Game {

/* *************************** */
/*         ATTRIBUTES          */
/* *************************** */
	private separator!: Mesh;
	private theme!:gameTheme;
	private environnement!: Environnement;
	private blackholeIn!: BlackHole;
	private blackholeOut!: BlackHole;

/* *************************** */
/*         CONSTRUCTOR         */
/* *************************** */
	constructor(
		type: gameType, key1: string, key2: string
	){
		super(type, key1, key2);
		this.theme = handleTheme(type);
	}

/* *************************** */
/*           METHODS           */
/* *************************** */

	protected initObjects(theme: gameTheme): void {
		super.initObjects();
		this.blackholeIn = new BlackHole(this.gameScene, 0);
		this.blackholeOut = new BlackHole(this.gameScene, 1);
	}
	
	protected addObjectsToScene(): void {
		super.addObjectsToScene();
		this.drawSeparator();
		this.gameScene.add(this.separator);
	}

	private drawSeparator() : void {
		const sideSeparator = new BoxGeometry(5, this.canvas.clientHeight, 1);
		this.separator = new Mesh(sideSeparator, new LineDashedMaterial({
			color: 0xffffff,
			dashSize: 2,
			gapSize: 2,
		}));
		this.separator.position.x = 0;
		this.separator.position.y = 0;
		this.separator.position.z = -100;
	}

	protected generateGameScene() {
		const cameraParams:CameraParams = {
			left: this.canvas.clientWidth / -2,
			right: this.canvas.clientWidth / 2,
			top: this.canvas.clientHeight / 2,
			bottom: this.canvas.clientHeight / -2,
			near: 0.1,
			far: 1000,
		}
		const gameSceneProps: GameSceneProps = {
			canvasSize: {width: this.canvas.clientWidth, height: this.canvas.clientHeight},
			camera: this.generateCamera(cameraParams) as OrthographicCamera,
			theme: this.theme
		}
		if (!this.theme?.theme.background){
			gameSceneProps.background = DEFAULT_BACKGROUND
		}
		gameSceneProps.camera.position.z = 5;
		this.setGameScene(gameSceneProps);
		this.gameScene.loadingScreen.setState('queue');
	}

	protected initEventListening(): void {
		super.initEventListening();
		this.canvas.addEventListener('resize', this.onResize);
	}

	protected removeEventListener() {
		super.removeEventListener();
		this.canvas.removeEventListener('resize', this.onResize);
	}

	private onResize = () => {
		const ratioWidth = this.canvas.clientWidth / CLASSIC_PONG_WIDTH;
		const ratioHeight = this.canvas.clientHeight / CLASSIC_PONG_HEIGHT;
		this.player1Pad.setRatios(ratioWidth, ratioHeight);
		this.player2Pad.setRatios(ratioWidth, ratioHeight);
		this.ball.setRatios(ratioWidth, ratioHeight);
		this.player1Pad.getMesh().scale.set(PAD_WIDTH * ratioWidth, PAD_HEIGHT * ratioHeight, 1);
		this.player2Pad.getMesh().scale.set(PAD_WIDTH * ratioWidth, PAD_HEIGHT * ratioHeight, 1);
		this.ball.getMesh().scale.set(1, BALL_RADIUS_CLASSIC * ratioHeight, 1);
		this.separator.scale.set(1, this.canvas.clientHeight, 1);
	}

	private displayBlackholes(gameData: GameData, action: bhState, index: number) {
		const targetBlackhole = (index === 0) ? this.blackholeIn : this.blackholeOut;
		targetBlackhole.setCoords(gameData.blackHole[index].x, gameData.blackHole[index].y)
		if (action === "appears") {
			console.log("on fade IIIIIN")
			targetBlackhole.fadeIn();
			targetBlackhole.setState(true);
		}
		else {
			targetBlackhole.fadeOut();
			targetBlackhole.setState(false);
		}
	}

	private manageBlackholesDisplay(gameData: GameData) {
		// console.log("BH 0 ARRIVING")
		if (gameData.blackHole[0].hasSpawned && !this.blackholeIn.isActive()) {
			this.displayBlackholes(gameData, "appears", 0);
		}
		if (gameData.blackHole[1].hasSpawned && !this.blackholeOut.isActive()) {
			this.blackholeOut.traverseAndTint(0x3F175B);
			this.displayBlackholes(gameData, "appears", 1);
		}
		if (gameData.blackHole[0].hasDisappear && this.blackholeIn.isActive()) {
				this.displayBlackholes(gameData, "disappears", 0);
		}
		if (gameData.blackHole[1].hasDisappear && this.blackholeOut.isActive()) {
				this.displayBlackholes(gameData, "disappears", 1);
		}
	}

	private setReiceiver() {
		this.receiveLoopId = setInterval(() => {
			if (!this.isInit && this.networking.gameData){
				this.isInit = true;
				console.log('Init game', this.isInit);
				this.gameScene.loadingScreen.disableLoadingScreen();
				console.log('User loaded');
				this.networking.userLoaded();
				this.logic.initScoreDisplay();
			}
			if (this.networking.gameData && this.networking.isReady) {
				const gameData = this.networking.gameData;

				this.player1Pad.updatePosition(gameData.pads[0].x, gameData.pads[0].y, 0);
				this.player2Pad.updatePosition(gameData.pads[1].x, gameData.pads[1].y, 0);
				this.ball.updatePosition(gameData.ball.x, gameData.ball.y, 0);
				this.manageBlackholesDisplay(gameData);
				if (gameData.score.length == 2) this.logic.updateScoreDisplay(this.networking.gameData);
			}
		}, 1000 / 120);
	}

	private async setEnvironnement(): Promise<void> {
		this.environnement = new Environnement(this.gameScene);
		await this.environnement.init();
		this.environnement.update();
		this.gameScene.addObject('environnement', this.environnement);
	}

	public async loadGame() {
		this.generateGameScene();
		await this.setEnvironnement();
		this.initObjects(this.theme);
		this.addObjectsToScene();
		this.setObserver();
		this.initObserver();
		this.gameScene.startRendering();
		this.setReiceiver();
		this.initEventListening();
	}
}