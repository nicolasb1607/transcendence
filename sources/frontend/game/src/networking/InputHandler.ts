import { REPEAT_SPEED, DEFAULT_MOUSE_INFO } from "../GameConstants";
import type { handler , mouseEventInfo } from "../types/GameDataTypes";
import type { GameScene } from "../display/GameScene";

export class InputHandler {

	private listOfPressedKeys: string[] = [];
	private mouseInfo: mouseEventInfo = DEFAULT_MOUSE_INFO;
	private listOfHandlers: handler[] = [];
	private loopId: NodeJS.Timeout | null;
	private mouseWheelPatch = 0; // the value of event.deltaY never resets to 0 (tested on Chrome), it fixes that

	constructor(gameScene: GameScene, mode: 'local' | 'online', allowMouse?: boolean) {

		this.loopId = null;

		// add event listeners
		// local mode = test or two players on same webpage
		// online mode = two players on different webpages
		const canvas = gameScene.getCanvas();
		canvas.focus();
		if (!canvas) throw new Error("game-container not found");
		if (mode == 'local')
		{
			canvas.addEventListener('keydown', this.keyDownHandler.bind(this));
			canvas.addEventListener('keyup', this.keyUpHandler.bind(this));
		}
		if (allowMouse)
		{
			canvas.addEventListener('mousemove', this.mouseMoveHandler.bind(this));
			canvas.addEventListener('mousedown', this.mouseDownHandler.bind(this));
			canvas.addEventListener('mouseup', this.mouseUpHandler.bind(this));
			canvas.addEventListener('wheel', this.mouseWheelHandler.bind(this));

			// prevent right click menu
			canvas.addEventListener('contextmenu', (event) => {
				event.preventDefault();
			});
		}

		// start the loop
		this.loopId = setInterval(() => {
			this.listOfHandlers.forEach((handler) => {
				handler(this.listOfPressedKeys, this.mouseInfo);
			});
			this.mouseInfo.mouseWheel = 0;
		}, REPEAT_SPEED /* Times per second we will give info to the handlers */);
	}

	/**
	 * add the key to the list of pressed keys
	 */
	private keyDownHandler(event: KeyboardEvent): void {
		if (!this.listOfPressedKeys.includes(event.key)) {
			this.listOfPressedKeys.push(event.key);
		}
	}

	/**
	 * remove the key from the list of pressed keys
	 */
	private keyUpHandler(event: KeyboardEvent): void {
		if (this.listOfPressedKeys.includes(event.key)) {
			this.listOfPressedKeys.splice(this.listOfPressedKeys.indexOf(event.key), 1);
		}
	}

	/**
	 * update the mouse info on mouse move
	 */
	private mouseMoveHandler(event: MouseEvent): void {
		this.mouseInfo.x = event.clientX;
		this.mouseInfo.y = event.clientY;
	}

	/**
	 * update the mouse info on mouse click
	 */
	private mouseDownHandler(event: MouseEvent): void {
		switch (event.button) {
		case 0:
			this.mouseInfo.leftButton = true;
			break;
		case 1:
			this.mouseInfo.middleButton = true;
			break;
		case 2:
			this.mouseInfo.rightButton = true;
			break;
		}

		this.mouseInfo.xOnLeftClick = event.clientX;
		this.mouseInfo.yOnLeftClick = event.clientY;
	}

	/**
	 * update the mouse info on mouse click
	 */
	private mouseUpHandler(event: MouseEvent): void {
		if (event.button == 0) {
			this.mouseInfo.leftButton = false;
		}
		else if (event.button == 1) {
			this.mouseInfo.middleButton = false;
		}
		else if (event.button == 2) {
			this.mouseInfo.rightButton = false;
		}
	}

	/**
	 * update the mouse info on mouse wheel
	 */
	private mouseWheelHandler(event: WheelEvent): void {
		this.mouseWheelPatch = event.deltaY;
		this.mouseInfo.mouseWheel = this.mouseWheelPatch;
	}

	// KEYBOARD HANDLER PUBLIC METHODS

	/**
	 * add a keyboard handler
	 */
	public addHandler(handler: handler): void {
		this.listOfHandlers.push(handler);
	}

	/**
	 * remove a keyboard handler
	 */
	public removeHandler(handler: handler): void {
		this.listOfHandlers.splice(this.listOfHandlers.indexOf(handler), 1);
	}

	// OTHER

	/**
	 * stop the input handler
	 */
	public stop(): void {
		if (this.loopId != null) {
			clearInterval(this.loopId);
		}
	}
}