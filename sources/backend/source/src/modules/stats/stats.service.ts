import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/providers/prisma/prisma.service";
import type { LeaderBoardUser, buildingLeaderBoardUser, enhanceUserStat, statKey, userStat, userStatByDate } from "./stats.interface";
import { AchievementService } from "../achievement/achievement.service";
import type { GameStatistics, Prisma } from "@prisma/client";
import { UsersService } from "../users/users.service";
import type { UserDetails } from "../users/users.interface";

@Injectable()
export class StatsService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly userService: UsersService,
		private readonly achievementService: AchievementService
	) {}

	/**
	 * Return the sum of a stat for given user
	 */
	async getUserStats(userId:number):Promise<userStat> {
		const userStats:userStat = {};
		const userSumStats = await this.prisma.gameStatistics.groupBy({
			where: {
				userId
			},
			by: ["key"],
			_sum: {
				value: true
			}
		});
		userSumStats.forEach((stat) => {
			userStats[stat.key] = stat._sum.value;
		});
		return (userStats);
	}

	/**
	 * Return sum of a stat all users
	 * @param statKey 
	 */
	async getUsersStats(statKey:statKey[]) {
		const usersSumStats = await this.prisma.gameStatistics.groupBy({
			where: {
				key: {
					in: statKey
				}
			},
			by: ["userId", "key"],
			_sum: {
				value: true,
			}
		});
		const statsGroupedByUser = usersSumStats.reduce((acc, stat) => {
			if (!acc[stat.userId]) {
				acc[stat.userId] = {};
			}
			acc[stat.userId][stat.key] = stat._sum.value;
			return (acc);
		}, {} as Record<number, userStat>);
		return (statsGroupedByUser);
	}

	/**
	 * Return the leaderboard for a given stat 
	 * For now only win_rate is available
	 * For now classic and spatial pong are not separated
	 * Must exclude people with less than 10 games played in the future
	 */
	async getLeaderboard():Promise<LeaderBoardUser[]> {
		const usersStats = await this.getUsersStats(['win', 'loose'] as statKey[]);
		const leaderboard:buildingLeaderBoardUser[] = [];

		for (const [userId, userStat] of Object.entries(usersStats)) {
			const win = userStat.win || 0;
			const loose = userStat.loose || 0;
			if (win < 3) continue;
			leaderboard.push({
				user: parseInt(userId),
				stats: {
					winRate: Math.round((win / (win + loose)) * 100),
					playedGames: win + loose
				}
			});
		}
		leaderboard.sort((a, b) => {
			if (a.stats.winRate > b.stats.winRate) return (-1);
			if (a.stats.winRate < b.stats.winRate) return (1);
			return (0);
		});
		const usersDetails = await this.userService
			.getUsersByIds(leaderboard.map((user) => user.user), true) as UserDetails[];
		return (leaderboard.map((user) => {
			return ({
				user: usersDetails.find((userDetails) => userDetails.ID === user.user) as LeaderBoardUser["user"],
				stats: user.stats
			});
		}));
	}

	async getEnhancedUserStats(userId:number):Promise<enhanceUserStat> {
		const userStats = await this.getUserStats(userId);
		const enhancedUserStats:enhanceUserStat = {
			...userStats,
			win_rate: userStats?.win && userStats.loose ? Math.round((userStats.win / (userStats.win + userStats.loose)) * 100) : undefined,
			total_game: userStats?.spatial_pong + userStats?.classic_pong,
		};
		return (enhancedUserStats);
	}

	/**
	 * Return the sum of a stat for a user
	 */
	async getUserStat(userId:number, stat:statKey):Promise<number> {
		const userSumStats = await this.prisma.gameStatistics.groupBy({
			where: {
				userId,
				key: stat
			},
			by: ["key"],
			_sum: {
				value: true
			}
		});
		if (userSumStats.length === 0) {
			return (0);
		}
		return (userSumStats[0]._sum.value);
	}

	async getUserStatsByDate(userId:number, startDate:Date, endDate:Date):Promise<userStatByDate> {
		const userStatsByDate:userStatByDate = {};
		const userStats = await this.prisma.gameStatistics.findMany({
			where: {
				userId,
				createdAt: {
					gte: startDate,
					lte: endDate
				}
			},
			orderBy: {
				createdAt: "asc"
			}
		});
		userStats.forEach((stat) => {
			const date = stat.createdAt.toISOString().split("T")[0];
			if (!userStatsByDate[date]) {
				userStatsByDate[date] = {};
			}
			userStatsByDate[date][stat.key] = stat.value;
		});
		return (userStatsByDate);
	}

	/**
	 * Do not wait for this function, achievement addition will be
	 * done in background
	 */
	async addStat(userId:number, gameId:number, key:statKey, value:number):Promise<GameStatistics> {
		const insertedStat = await this.prisma.gameStatistics.create({
			data: {
				userId,
				gameId,
				key,
				value
			}
		});
		const currentStatSum = await this.getUserStat(userId, key);
		await this.achievementService.handleStatisticAchievement(userId, key, currentStatSum);
		return (insertedStat);
	}

	/**
	 * Add stat object to the database
	 * Do not wait for this function, achievement addition will be
	 * done in background
	 * @returns The number of inserted stats
	 */
	async bulkAddStats(userId:number, gameId:number, stats:userStat):Promise<Prisma.BatchPayload> {
		const statsToInsert:Prisma.GameStatisticsCreateInput[] = [];

		for (const key in stats) {
			statsToInsert.push({
				userId,
				gameId,
				key,
				value: stats[key]
			});
		}
		const insertedStats:Prisma.BatchPayload = await this.prisma.gameStatistics.createMany({
			data: statsToInsert
		});
		const currentStatsSum:userStat = await this.getUserStats(userId);
		await this.achievementService.handleBulkStatisticAchievement(userId, currentStatsSum);
		return (insertedStats);
	}

	//Must no be exposed to non-admin users
	async removeUserStats(userId:number):Promise<void> {
		await this.prisma.gameStatistics.deleteMany({
			where: {
				userId
			}
		});
	}
}