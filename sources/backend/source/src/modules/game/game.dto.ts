import { GameType } from "@prisma/client";
import { IsEnum } from "class-validator";

/**
 * Receive keyboard input from the user
 */
export class UserInputDTO {
	// Si ca fonctionne plus regarder du cote des decorators
	isMovingUp: boolean;
	isMovingDown: boolean;
}

export class JoinQueueDTO {
	@IsEnum(GameType)
		type: GameType
}