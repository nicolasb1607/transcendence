import { OrthographicCamera } from "three";

import { GameScene, type GameSceneOptions } from "../../display/GameScene";
import type { gameListener, gameType } from "../../types/GameDataTypes";
import { Networking } from "../../networking/Networking";
import type { CameraParams } from "../../types/utils";
import { Ball } from "../../objects/Ball";
import { GameLogic } from "../GameLogic";
import { Pad } from "../../objects/Pad";
import type { gameTheme } from "../../types/theme";


export class Game {

	/* *************************** */
	/*         ATTRIBUTES          */
	/* *************************** */
	protected config!: { subtree: boolean, childList: boolean };
	protected idStopSendingInput!: NodeJS.Timeout;
	protected receiveLoopId!: NodeJS.Timeout;
	protected observer!: MutationObserver;
	protected networking: Networking;
	protected gameScene!: GameScene;
	protected listOfKeys: string[];
	protected logic!: GameLogic;
	protected player1Pad!: Pad;
	protected player2Pad!: Pad;
	protected ball!: Ball;
	private gameListener!:gameListener;
	public canvas!: HTMLCanvasElement;
	public isInit!: boolean;
	public type: gameType;
	public key1!: string;
	public key2!: string;

	/* *************************** */
	/*         CONSTRUCTOR         */
	/* *************************** */
	constructor(
		type: gameType, key1: string, key2: string
	) {
		this.type = type;
		this.networking = new Networking(this.type);
		this.logic = new GameLogic(2);
		this.key1 = key1;
		this.key2 = key2;
		this.listOfKeys = [];
		this.canvas = document.querySelector('#game-scene') as HTMLCanvasElement;
		this.isInit = false;
		this.initListeners();

		const stopGame = this.stopGame.bind(this)
		this.networking.setEndGameCallback(stopGame);
	}

	/* *************************** */
	/*           METHODS           */
	/* *************************** */
	private initListeners(): void {
		this.gameListener = {
			sendPlayerInput: this.sendPlayerInput.bind(this),
			stopSendingPlayerInput: this.stopSendingPlayerInput.bind(this),
			outOfFocus: this.outOfFocus.bind(this),
		};
	}

	protected initObjects(theme?:gameTheme): void {
		const padColors = [
			theme?.theme.pad?.[0].color || 0xffffff,
			theme?.theme.pad?.[1].color || 0xffffff
		]
		this.player1Pad = new Pad('player1', this.type, padColors[0], 'left', this.gameScene);
		this.player1Pad.id = 0;
		this.player2Pad = new Pad('player2', this.type, padColors[1], 'right', this.gameScene);
		this.player2Pad.id = 1;
		this.ball = new Ball(this.type, theme?.theme?.ballColor);
		this.networking.pads[0] = this.player1Pad;
		this.networking.pads[1] = this.player2Pad;
	}

	protected initEventListening(): void {
		this.canvas.addEventListener('keydown', this.gameListener.sendPlayerInput);
		this.canvas.addEventListener('keyup', this.gameListener.stopSendingPlayerInput);
		this.canvas.addEventListener(('blur'), this.gameListener.outOfFocus);
	}

	protected removeEventListener() {
		this.canvas.removeEventListener('keydown', this.gameListener.sendPlayerInput);
		this.canvas.removeEventListener('keyup', this.gameListener.stopSendingPlayerInput);
		this.canvas.removeEventListener('blur', this.gameListener.outOfFocus);
	}

	protected addObjectsToScene(): void {
		this.gameScene.add(this.player1Pad.getMesh());
		this.gameScene.add(this.player2Pad.getMesh());
		this.gameScene.add(this.ball.getMesh());
	}

	private sendPlayerInput(event: KeyboardEvent): void {
		if (event.key == this.key1 && !(this.listOfKeys.includes(this.key1))) {
			this.networking.userInput({ isMovingUp: true, isMovingDown: false });
			this.listOfKeys.push(event.key);
		}
		else if (event.key == this.key2 && !(this.listOfKeys.includes(this.key2))) {
			this.networking.userInput({ isMovingUp: false, isMovingDown: true });
			this.listOfKeys.push(event.key);
		}
	}

	private stopSendingPlayerInput(event: KeyboardEvent): void {
		if (event.key == this.key1) {
			this.listOfKeys = this.listOfKeys.filter(key => key != this.key1);
			this.networking.userInput({ isMovingUp: false, isMovingDown: this.listOfKeys.includes(this.key2) });
		}
		else if (event.key == this.key2) {
			this.listOfKeys = this.listOfKeys.filter(key => key != this.key2);
			this.networking.userInput({ isMovingUp: this.listOfKeys.includes(this.key1), isMovingDown: false });
		}
	}

	private outOfFocus(): void {
		this.networking.userInput({ isMovingUp: false, isMovingDown: false });
		this.listOfKeys = [];
	}

	protected setObserver(): void {
		const lastLocation = location.href;

		this.observer = new MutationObserver(() => {
			if (location.href == lastLocation) return;
			console.log(`URL changed to ${location.href}`);
			this.networking.disconnect();
			this.removeEventListener();
			clearInterval(this.idStopSendingInput);
			if (this.receiveLoopId) clearInterval(this.receiveLoopId);
			this.gameScene.stopRendering();
			this.observer.disconnect();
		})
	}

	protected initObserver() {
		this.config = { subtree: true, childList: true };
		this.observer.observe(document, this.config);
	}

	protected stopGame(): void {
		this.removeEventListener();
		clearInterval(this.idStopSendingInput);
		this.gameScene.stopRendering();
	}

	protected generateCamera(params: CameraParams): OrthographicCamera {
		const camera = new OrthographicCamera(
			params.left,
			params.right,
			params.top,
			params.bottom,
			params.near,
			params.far,
		);
		return (camera);
	}

	protected setGameScene(opts: GameSceneOptions): void {
		this.gameScene = new GameScene(opts);
	}
}