import topBottom from "../assets/image/topBottomKeys.svg"
import rightLeft from "../assets/image/rightLeftKeys.svg"

class Helper {

	private helperDiv: HTMLDivElement|null = null;
	private countdownDiv: HTMLDivElement = document.createElement('div');
	private keyHelperDiv: HTMLDivElement = document.createElement('div');

	constructor() {
		this.initDiv();
	}

	public initDiv():void {
		const gameContainer = document.querySelector(".game-content") as HTMLDivElement;
		if (!gameContainer) throw new Error("Missing game container");
		this.helperDiv = document.createElement('div');
		this.helperDiv.id = 'helper';
		this.keyHelperDiv.id = 'key-helper';
		this.countdownDiv.id = 'countdown';
		this.helperDiv.appendChild(this.keyHelperDiv);
		this.helperDiv.appendChild(this.countdownDiv);
		gameContainer.appendChild(this.helperDiv);
	}

	public showKeys(type: 'topBottom'|'rightLeft'):void {
		if (!this.helperDiv) throw new Error("Missing helper div");
		const keyHelper = this.helperDiv.querySelector("#key-helper") as HTMLDivElement;
		if (!keyHelper) throw new Error("Missing key helper");
		keyHelper.innerHTML = `
			<img src="${type === 'topBottom' ? topBottom : rightLeft}" alt="keys">
		`;
		setTimeout(() => {
			keyHelper.style.animation = 'fadeOut 1s ease-in-out forwards';
			setTimeout(() => {
				keyHelper.style.animation = '';
				this.hideKeys();
			}, 1000);
		}, 5000);
	}

	public hideKeys():void {
		if (!this.helperDiv) throw new Error("Missing helper div");
		const keyHelper = this.helperDiv.querySelector("#key-helper") as HTMLDivElement;
		if (!keyHelper) throw new Error("Missing key helper");
		keyHelper.innerHTML = '';
	}

	public showCountdown(start:number):void {
		if (!this.countdownDiv) throw new Error("Missing countdown div");
		this.countdownDiv.innerHTML = `<span>${start}</span>`
		this.countdownDiv.style.display = 'block';
		const interval = setInterval(() => {
			const current = parseInt(this.countdownDiv.firstChild?.textContent || '0');
			if (current > 1) {
				this.countdownDiv.innerHTML = `<span>${current - 1}</span>`
			} else {
				this.countdownDiv.style.display = 'none';
				clearInterval(interval);
			}
		}, 1000);
	}
}
export default Helper;