import type { GameData } from "../types/GameDataTypes";

export class GameLogic {

	private numberOfPlayers;
	private canvas!:HTMLElement;

	constructor(numberOfPlayers = 2) {
		if (numberOfPlayers < 2) throw new Error("Invalid numberOfPlayers");
		this.numberOfPlayers = numberOfPlayers;
	}

	public initScoreDisplay():void {
		const canvas = document.getElementById("game-scene");
		if (!canvas) return;
		this.canvas = canvas;
		const scoreHTML = this.numberOfPlayers === 2 ? `
			<span id="user1">0</span>
			<span id="user2">0</span>
		` : `<span id="currentUser">0</span>`
		this.canvas.insertAdjacentHTML("beforebegin", `<div style="
			width: 100%;
			display: flex;
			justify-content: center;
			gap: 10%"
			id='score'>${scoreHTML}</div>`);
	}

	public updateScoreDisplay(gameData: GameData):void {
		if (this.numberOfPlayers === 2){
			const scoreUser1 = document.getElementById("user1");
			const scoreUser2 = document.getElementById("user2");
			if (!scoreUser1 || !scoreUser2) throw new Error("Missing score fields");
			const user1Score = gameData.score[0];
			const user2Score = gameData.score[1];
			scoreUser1.innerHTML = user1Score.toString();
			scoreUser2.innerHTML = user2Score.toString();
		} else {
			//get index of current number
			const score = document.getElementById("currentUser");
			if (!score) throw new Error("Missing score fields");
			score.innerHTML = "0";
		}
	}
}