/* eslint-disable @typescript-eslint/no-unused-vars */
type UserRankingKeys = "winRate" | "playedGames";

type StatRecord = Record<UserRankingKeys, number>

interface LeaderBoardUser {
	user: Omit<UserDetails, "role"|"email"|"isActive">,
	/**
	 * Object containing UserRankingKeys
	 * List of stats for the user
	 * Stats may be modified from the original stat table, grouped, etc.
	 */
	stats: StatRecord;
}
// defelect_shot aren't unlockable for now, cascade_bounce
type statKey = "bounce" | "play_time" | "score" | "deflect_shot" | "max_game_speed" | "win" | "loose" | "cascade_bounce" | "wormhole" | "classic_pong" | "spatial_pong";
type enhanceStatKeys = "win_rate" | "total_game"

/**
 * An object containing all the stats of a user
 */
type userStat = {
	[key in statKey]?: number;
}

type enhanceUserStat = userStat & {
	[key in enhanceStatKeys]?: number;
}

type statDisplayRecord = Record<enhanceStatKeys|statKey, {
	name?: string
	display?: boolean
	convert?: (value: number|undefined) => number
}>;

type statsDisplayConfig = Partial<statDisplayRecord>;