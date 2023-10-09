import type { UserDetails } from "../users/users.interface";

//deflect shot isn't implemented yet
export type statKey = "bounce" | "play_time" | "score" | "deflect_shot" | "max_game_speed" | "win" | "loose" | "cascade_bounce" | "wormhole" | "classic_pong" | "spatial_pong";
export type enhanceStatKeys = "win_rate" | "total_game"
/**
 * An object containing all the stats of a user
 */
export type userStat = {
	[key in statKey]?: number;
}

export type enhanceUserStat = userStat & {
	[key in enhanceStatKeys]?: number;
}

/**
 * An object containing all the stats of a user, grouped by date
 * @note the key is a stringified date
 */
export interface userStatByDate {
	[key: string]: userStat;
}

type UserRankingKeys = "winRate" | "playedGames";
type StatRecord = Record<UserRankingKeys, number>

export interface LeaderBoardUser {
	user: Omit<UserDetails, "role"|"email"|"isActive">,
	stats: StatRecord;
}

export interface buildingLeaderBoardUser extends Omit<LeaderBoardUser, "user"> {
	user: number
}