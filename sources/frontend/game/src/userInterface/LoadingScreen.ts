import type { LoadingManager } from 'three';
import loadingScreenImage from '../../assets/image/loading.png';

type loadingScreenState = 'environnement' | 'queue';

class LoadingScreen {

	private loadingScreen!:HTMLElement;
	private loadingProgress = 0;
	private hasLoaded = false;
	private state:loadingScreenState = 'environnement';

	constructor(
		private loadingManager:LoadingManager
	) {
		this.init();
	}

	private init() {
		const loadingScreen = document.getElementById("loading-screen");
		if (!loadingScreen) throw new Error("Missing loading screen elements");
		this.loadingScreen = loadingScreen;
		//insert loading screen image
		this.loadingScreen.insertAdjacentHTML("beforeend", `<img src="${loadingScreenImage}" alt="loading screen" id="loading-screen-image">`);
		this.loadingManager.onLoad = this.onLoadingComplete.bind(this);
		this.loadingManager.onProgress = this.onLoadingProgress.bind(this);
	}

	public setState(state:loadingScreenState) {
		this.state = state;
		if (state === 'queue'){
			this.loadingProgress = 1;
		}
		this.genLoaderArea();
	}

	public disableLoadingScreen() {
		console.log("Disabling loading screen", this.loadingScreen);
		this.loadingScreen.style.display = "none";
	}

	private onLoadingComplete() {
		console.log("Loading complete");
		this.hasLoaded = true;
		this.state = 'queue';
		this.genLoaderArea();
	}

	private onLoadingProgress(_:string, loaded:number, total:number) {
		console.log(`Loading : ${loaded} / ${total}`);
		this.loadingProgress = loaded / total;
		this.genLoaderArea();
	}

	private genLoaderArea() {
		const loaderArea = document.getElementById("loader-area");
		if (!loaderArea) throw new Error("Missing loader area");
		const progress = Math.round(this.loadingProgress * 100);
		const text = this.state === 'environnement' ? 'Loading Assets' : 'Waiting for other players';
		const progressText = this.state === 'environnement' ? '(' + progress + '%)' : '';
		loaderArea.innerHTML = `
			<h1>${text}... ${progressText}</h1>
			<div id="loader">
				<div id="loader-bar" class="bar" style="width: ${progress}%"></div>
				<div id="bar-end" class="bar" style="left: calc(${progress}% - 10px)"></div>
				<div id="bar-end-2" class="bar" style="left: calc(${progress}%)"></div>
			</div>
		`;
	}

	public getHasLoaded():boolean {
		return (this.hasLoaded);
	}

	/**
	 * @returns a number between 0 and 1
	 */
	public getLoadingProgess():number {
		return (this.loadingProgress);
	}
}
export default LoadingScreen;