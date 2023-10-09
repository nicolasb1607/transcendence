import jwtDecode from "jwt-decode";
import type { FinalGameData } from "../types/network";
import type { user } from "../types/user";
import type { JWTData } from "../../../../backend/source/src/modules/auth/auth.interface";
import buttonBackground from "../../assets/image/button.svg";

const levelColors = ["#696969","#10A7BC","#B51D35"]

const getJWT = ():string|null => {
	return (document.cookie.split('; ').find(row => row.startsWith('jwt_token'))?.split('=')[1] || null);
}

export class EndScreenGUI {
	
	private win = false;
	private endScreen!:HTMLElement;
	private score:number[] = [0, 0];
	private gameExp = 0;
	private gameDuration = 0;
	private participants:user[] = [];
	private currentUserId = 0;

	constructor(){
		const endScreen = document.getElementById("end-screen");
		if (!endScreen) throw new Error("Missing end screen elements");
		this.endScreen = endScreen;
		const jwt = jwtDecode<JWTData>(getJWT() || '');
		if (!jwt) throw new Error("Invalid JWT");
		this.currentUserId = jwt.ID;

	}

	public show(){
		this.render();
	}

	public hide(){
		this.endScreen.innerHTML = '';
	}

	public setGame(game:FinalGameData){
		const playerIndex = game.players.indexOf(this.currentUserId);
		this.score = game.score;
		this.gameExp = game.exp[playerIndex];
		this.gameDuration = game.duration;
		this.participants = game.participants;
		this.win = game.winnerId === this.currentUserId;
	}

	private genBanner(){
		return (`
			<div id="end-screen-banner">
				<h1>${this.win ? 'Victory' : 'Defeat'}</h1>
			</div>
		`)
	}

	private genAvatar(user:user){
		return (`
			<div class="end-screen-avatar">
				<div class="avatar" style="border-color:${levelColors[Math.floor((user.experience?.level || 0) / 10)]}">
					<img src="${process.env.API_URL}${user.avatar}" alt="avatar" title="${user.login}"/>
				</div>
				<div class="end-screen-avatar-text">
					<span>${user.login}</span>
				</div>
			</div>
		`)
	}

	private genScore(){
		return (`
			<div id="end-screen-score">
				${this.genAvatar(this.participants[0])}
				<div id="end-screen-score-text">
					<h1>${this.score[0]} / ${this.score[1]}</h1>
				</div>
				${this.genAvatar(this.participants[1])}
			</div>
		`)
	}

	private genGameDetails(){
		//duration as MM:SS
		const duration = new Date(this.gameDuration * 1000).toISOString().substr(14, 5);
		return (`
			<div id="end-screen-game-details">
				<div class="end-screen-game-detail">
					<span>GAME TIME</span>
					<span>${duration}</span>
				</div>
				<div class="end-screen-game-detail">
					<span>GAME EXP</span>
					<span>${this.gameExp}</span>
				</div>
			</div>
		`)
	}

	private genButtons(){
		const style = `background-image: url(${buttonBackground});`
		const urlWithoutQuery = window.location.href.split('?')[0];
		return (`
			<div id="end-screen-buttons">
				<a href="${urlWithoutQuery}">
					<button style="${style}" id="end-screen-play-again">Play Again</button>
				</a>
				<a href="/">
					<button style="${style}" id="end-screen-leave">Home</button>
				</a>
			</div>
		`)
	}

	public render(){
		this.endScreen.style.display = "flex";
		this.endScreen.innerHTML = `
			${this.genBanner()}
			<div id="end-screen-content">
				${this.genScore()}
				${this.genGameDetails()}
			</div>
			${this.genButtons()}
		`;
	}

	public setWin(win:boolean){
		this.win = win;
	}
}