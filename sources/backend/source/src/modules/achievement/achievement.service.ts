import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../common/providers/prisma/prisma.service";
import type { Achievement } from "./achievement.interface";
import type { UserAchievement } from "@prisma/client";

import * as achievements from "./achievements.json";
import type { statKey, userStat } from "../stats/stats.interface";
import { EventEmitter2 } from "@nestjs/event-emitter";

const badges = achievements.badges as Achievement[];

@Injectable()
export class AchievementService {
	constructor(
		private readonly logger: Logger,
		private readonly prisma: PrismaService,
		private readonly eventEmitter: EventEmitter2
	) {}

	async getUserAchievements(userId: number, shortRes = false):Promise<Achievement[]|number[]> {

		const userAchievements:Pick<UserAchievement,"achievementId">[] = await this.prisma.userAchievement.findMany({
			select: {
				achievementId: true,
			},
			where: {
				userId
			}
		});
		if (!userAchievements) return ([]);
		if (shortRes) {
			return (userAchievements.map((userAchievement) => userAchievement.achievementId));
		}
		const userAchievementsIds = userAchievements
			.map((userAchievement) => userAchievement.achievementId);
		return (badges.filter((achievement) => userAchievementsIds.includes(achievement.id)));
	}

	/**
	 * Parse achievements associated to a statKey, and return the ids of
	 * achievements that can be unlocked where the sum of the statKey is
	 * greater than the statValue
	 */
	private getUserAchievementsIds(
		userAchievements:Achievement[],
		associatedAchievements:Achievement[],
		sumValue:number
	):Achievement[] {
		const userAchievementsIds = userAchievements.map((achievement) => achievement.id);
		return (associatedAchievements.filter((achievement) => {
			if (achievement?.unlock?.statValue <= sumValue) {
				return (!userAchievementsIds.includes(achievement.id));
			} else if (achievement?.unlock?.OR) {
				return (achievement.unlock.OR.some((condition) => {
					if (condition.statValue <= sumValue) {
						return (!userAchievementsIds.includes(achievement.id));
					}
				}));
			}
			return (false);
		}));
	}

	/**
	 * Get associated achievements to a statKey, and check if the sum of
	 * the statKey is greater than the statValue to unlock the achievement
	 * Unlock the achievement if it's the case
	 */
	async handleStatisticAchievement(
		userId: number,
		statKey:statKey,
		sumValue: number
	):Promise<number[]|null> {
		const associatedAchievements = badges.filter((achievement) => {
			if (achievement?.unlock?.statKey === statKey) {
				return (true);
			} else if (achievement?.unlock?.OR) {
				return (achievement.unlock.OR.some((condition) => condition.statKey === statKey));
			}
			return (false);
		});
		const userAchievements = await this.getUserAchievements(userId) as Achievement[];
		const userAchievementsIdsToUnlock = await this.getUserAchievementsIds(userAchievements, associatedAchievements, sumValue);
		if (userAchievementsIdsToUnlock.length > 0) {
			const userAchievementsIds = userAchievementsIdsToUnlock.map((achievement) => achievement.id);
			await this.bulkAddAchievements(userId, userAchievementsIds);
			return (userAchievementsIds);
		}
		return (null);
	}

	/**
	 * Retrieve all achievements associated to a statKey from (stats), and 
	 * check if the sum of the statKey is greater than the statValue to
	 * unlock the achievement
	 * Unlock the achievement if it's the case
	 * @returns the ids of the achievements unlocked
	 */
	async handleBulkStatisticAchievement(userId: number, stats:userStat):Promise<number[]|null> {
		const StatsKeys = Object.keys(stats);
		const userAchievements = await this.getUserAchievements(userId) as Achievement[];
		let userAchievementsIdsToUnlock = [];
		for (const statKey of StatsKeys) {
			const associatedAchievements = badges.filter((achievement) => {
				if (achievement?.unlock?.statKey && achievement.unlock.statKey === statKey) {
					return (true);
				} else if (achievement?.unlock?.OR) {
					return (achievement.unlock.OR.some((condition) => condition.statKey === statKey));
				}
				return (false);
			});
			userAchievementsIdsToUnlock.push(...await this.getUserAchievementsIds(userAchievements, associatedAchievements, stats[statKey]));
		}
		const userCurrentAchievementIds = userAchievements.map((achievement) => achievement.id);
		userAchievementsIdsToUnlock = userAchievementsIdsToUnlock.filter((achievementId) => {
			return (!userCurrentAchievementIds.includes(achievementId));
		}).filter((achievement, index, self) => {
			return (index === self.findIndex((t) => (
				t.id === achievement.id
			)));
		});
		if (userAchievementsIdsToUnlock.length > 0) {
			this.logger.log(`User ${userId} unlocked ${userAchievementsIdsToUnlock.length} achievements`);
			const userAchievementsIds = userAchievementsIdsToUnlock.map((achievement) => achievement.id);
			await this.bulkAddAchievements(userId, userAchievementsIds);
			return (userAchievementsIds);
		}
		return (null);
	}


	async addAchievement(userId: number, achievementId: number):Promise<void> {
		await this.prisma.userAchievement.create({
			data: {
				achievementId,
				userId
			}
		});
		this.eventEmitter.emit('user.achievement.update', {
			userId,
			achievementIds: [achievementId]
		});
	}
	
	private async bulkAddAchievements(userId: number, achievementIds: number[]):Promise<void> {
		await this.prisma.userAchievement.createMany({
			data: achievementIds.map((achievementId) => ({
				achievementId,
				userId
			}))
		});
		this.eventEmitter.emit('user.achievement.update', {
			userId,
			achievementIds
		});
	}

	async removeAchievement(userId: number, achievementId: number):Promise<void> {
		await this.prisma.userAchievement.deleteMany({
			where: {
				achievementId,
				userId
			}
		});
	}

	//this function must not be exposed to non-admin users
	async removeAllUserAchievements(userId: number):Promise<void> {
		await this.prisma.userAchievement.deleteMany({
			where: {
				userId
			}
		});
	}
}