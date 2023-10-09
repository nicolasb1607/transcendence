import { io } from "socket.io-client"
import type { Socket } from 'socket.io-client';
import type { GameData, GameUpdate, gameType } from "../types/GameDataTypes";
import type { FinalGameData, UserInputDTO } from "../types/network";
import { EndScreenGUI } from "../userInterface/EndScreen";
import type { NestError } from "../types/error";
import jwtDecode from "jwt-decode";
import type { Pad } from '../objects/Pad'
import Helper from "../helper.gui";
import type { JWTData } from "../types/user";


export let socket:Socket;

const getJWT = ():string|null => {
	return (document.cookie.split('; ').find(row => row.startsWith('jwt_token'))?.split('=')[1] || null);
}

export class Networking {

	private userToken!:string;
	private endGameCallback?:() => void;
	//True when both players have loaded the game, and are ready to start
	public isReady = false;
	public finalCountdown = false;
	public jwt = jwtDecode<JWTData>(getJWT() || '');
	public gameData:GameData|undefined = undefined;
	public pads: Pad[] = [];
	public endScreenGUI: EndScreenGUI = new EndScreenGUI();

	constructor(
		private readonly type:gameType
	){
		const userToken = getJWT();
		if (!userToken) throw new Error("User not logged in");
		this.userToken = userToken;
		this.initSocket();
	}

	public setEndGameCallback(callback:() => void){
		this.endGameCallback = callback;
	}

	public addPads(pl1: Pad, pl2: Pad) {
		this.pads.push(pl1);
		this.pads.push(pl2);
	}

	initSocket(){
		console.log("Connecting to server");
		socket = io(process.env.SOCKET_URL as string, {
			path: "/game",
			auth: { token: this.userToken }
		});
		socket.on("connect", this.onConnect.bind(this));
		socket.on("disconnect", this.onDisconnect.bind(this));
		socket.on("initGame", this.onInitGame.bind(this));
		socket.on("gameReady", this.onGameReady.bind(this));
		socket.on("endGame", this.onEndGame.bind(this));
		socket.on("gameUpdate", this.onGameUpdate.bind(this));
		socket.on("exception", this.onException.bind(this));
		const challengeGameId = new URLSearchParams(window.location.search).get("gameId");
		if (challengeGameId){
			this.joinChallengeGame(challengeGameId);
		} else {
			this.joinQueue();
		}
	}

	onConnect(){
		console.log("Connected to server");
	}

	onDisconnect(){
		console.log("Disconnected from server");
	}

	disconnect(){
		socket.emit("disconnectEvent");
		socket.off("connect", this.onConnect);
		socket.off("disconnect", this.onDisconnect);
		socket.off("initGame", this.onInitGame);
		socket.off("gameReady", this.onGameReady);
		socket.off("endGame", this.onEndGame);
		socket.off("gameUpdate", this.onGameUpdate);
		socket.off("exception", this.onException);
		socket.disconnect();
	}

	/**
	 * @event joinQueue
	 */
	joinQueue(){
		socket.emit("joinQueue", {
			type: this.type + "Pong"
		});
	}

	joinChallengeGame(gameId:string){
		socket.emit("joinChallengeGame", gameId);
	}

	leaveQueue(){
		throw new Error("Method not implemented.");
		socket.emit("leaveQueue");
	}
	
	/**
	 * @event userInput
	 */
	userInput(input:UserInputDTO){
		socket.emit("userInput", input);
		console.log("User input sent", input);
	}

	/**
	 * @event userLoaded
	 */
	userLoaded(){
		socket.emit("userLoaded");
		console.log("User loaded sent");
	}

	onInitGame(data:GameData){
		console.log("Game init", data);
		this.gameData = data;
		console.log("initGame, data =", data)
	}

	onGameReady(startDate:number){
		console.log("gamedata = ", this.gameData)
		if (!this.gameData) throw new Error("Game data not initialized");
		console.log("Game ready", startDate);
		//todo handle date
		this.gameData.startDate = new Date(startDate);
		const playerID:number = (this.gameData?.players[0] === this.jwt.ID) ? 0 : 1;
		const leftTimeBeforeCountdown = this.gameData.startDate.getTime() - (Date.now() + 3000);
		const countdown = leftTimeBeforeCountdown > 0 ? this.gameData.startDate.getTime() - (Date.now() + leftTimeBeforeCountdown) : 0;
		console.log({leftTimeBeforeCountdown, countdown})
		const beforeCountdownInterval = setInterval(() => {
			clearInterval(beforeCountdownInterval);
			const helper = new Helper();
			helper.showKeys("topBottom");
			helper.showCountdown(3);
			this.pads[playerID].blink();
			const countdownInterval = setInterval(() => {
				clearInterval(countdownInterval);
				this.isReady = true;
			}, countdown);
		}, leftTimeBeforeCountdown);
	}

	onGameUpdate(data:GameUpdate){
		if (!this.gameData) throw new Error("Game data not initialized");
		const newPads = this.gameData.pads.map((pad, index) => {
			return ({
				...pad,
				...data.pads[index]
			})
		});
		const gameUpdateWithoutPad = {
			...data,
			pads: undefined
		}
		this.gameData = {
			...this.gameData,
			...gameUpdateWithoutPad,
			pads: newPads
		}
	}

	onEndGame(game:FinalGameData){
		this.gameData = undefined;
		this.isReady = false;
		if (this.endGameCallback) this.endGameCallback();
		console.log("Game ended", game);
		this.endScreenGUI.setGame(game);
		this.endScreenGUI.show();
	}

	onException(error:NestError){
		console.log("Exception", error);
		if (error.error === "Not Found" && error.message.includes("Game")){
			//remove query params
			const url = new URL(window.location.href);
			url.searchParams.delete("gameId");
			window.history.replaceState({}, document.title, url.toString());
		}
	}
}