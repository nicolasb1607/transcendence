import { AudioLoader, AudioListener, PositionalAudio, Camera } from "three";

import backgroundMusic from '../../assets/audio/bgm_0.mp3';
import volumeUp from '../../assets/image/VolumeUp.svg';
import volumeMute from '../../assets/image/VolumeMute.svg';

class SoundManager {
	private listener: AudioListener;
	private audioLoader: AudioLoader;
	private backgroundMusic!: PositionalAudio;
	private soundButton!: HTMLButtonElement;

	constructor(camera: Camera) {
		this.initSoundButton();
		this.listener = new AudioListener();
		camera.add(this.listener);
		this.audioLoader = new AudioLoader();
		this.loadBackgroundMusic();
		
		this.stopSoundOnClose();
	}
	
	private initSoundButton(): void {
		this.soundButton = document.getElementById("mute") as HTMLButtonElement;
		this.soundButton.addEventListener("click", this.soundButtonListener.bind(this));
		this.soundButton.classList.add("unmute");
		this.soundButton.setAttribute("src", volumeUp);
	}

	private soundButtonListener(): void {
		this.toggleSound();
	}

	private toggleSound(): void {
		if (this.soundButton.classList.contains("mute")) {
			this.soundButton.classList.remove("mute");
			this.soundButton.classList.add("unmute");
			this.soundButton.setAttribute("src", volumeUp);
			this.playBackgroundMusic();
		} else {
			this.soundButton.classList.remove("unmute");
			this.soundButton.classList.add("mute");
			this.soundButton.setAttribute("src", volumeMute);
			this.pauseBackgroundMusic();
		}
	}

	/**
	 * When page changes, stop all sounds
	 * @see https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Proxy
	 */
	public stopSoundOnClose(): void {
		if (this.listener.context.state === 'running') {
			window.history.pushState = new Proxy(window.history.pushState, {
				apply: (target, thisArg, argArray) => {
					this.stopAll();
					window.history.pushState = target;//remove proxy
					//@ts-ignore
					return (target.apply(thisArg, argArray));
				},
			});
		}
	}

	private stopAll(): void {
		console.log("stop sound on close")
		this.backgroundMusic.stop();
		this.listener.context.close();
	}

	public loadBackgroundMusic() {
		this.audioLoader.load(
			backgroundMusic,
			(buffer) => {
				this.backgroundMusic = new PositionalAudio(this.listener);
				this.backgroundMusic.setBuffer(buffer);
				this.backgroundMusic.setLoop(true);
				this.backgroundMusic.setVolume(0.5);
				this.backgroundMusic.setRefDistance(700);
				this.backgroundMusic.play();
				console.log(this.backgroundMusic)
			},
			(xhr) => {
				console.log('Bg music ' + (xhr.loaded / xhr.total * 100) + '% loaded');
			}
		);
	}

	public playBackgroundMusic(): void {
		if (this.backgroundMusic) {
			this.backgroundMusic.play();
		}
	}

	public pauseBackgroundMusic(): void {
		if (this.backgroundMusic) {
			this.backgroundMusic.pause();
		}
	}

	public stopBackgroundMusic(): void {
		if (this.backgroundMusic) {
			this.backgroundMusic.stop();
		}
	}
}
export default SoundManager;