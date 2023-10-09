/* eslint-disable @typescript-eslint/no-unused-vars */

type UserRankingKeys = "winRate" | "playedGames";

type StatRecord = Record<UserRankingKeys, number>

interface LeaderBoardUser {
	user: Omit<UserDetails, "role"|"email"|"status">,
	/**
	 * Object containing UserRankingKeys
	 * List of stats for the user
	 * Stats may be modified from the original stat table, grouped, etc.
	 */
	stats: Record<GameType, StatRecord>
}