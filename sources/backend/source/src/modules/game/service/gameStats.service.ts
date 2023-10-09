import { Injectable } from "@nestjs/common";
import type { GameData } from "../game.interface";
import type { statKey } from "../../stats/stats.interface";

/**
 * Handle stats management related to in game events
 */
@Injectable()
export class GameStatsService {
	public updateGameStats(game:GameData, playerIndex: number, key: statKey, value: number): void {
		if (!game.stats[playerIndex]) game.stats[playerIndex] = {};
		if (!(key in game.stats[playerIndex])) {
			game.stats[playerIndex][key] = 0;
		}
		if (key === "max_game_speed") {
			game.stats[playerIndex][key] = value;
		} else game.stats[playerIndex][key] += value;
	}
}