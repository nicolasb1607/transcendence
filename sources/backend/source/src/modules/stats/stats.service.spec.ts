import { getTestingModule } from "../../../test/utils/utils.functions";
import { PrismaService } from '../../common/providers/prisma/prisma.service';
import { StatsService } from './stats.service';
import { AchievementService } from "../achievement/achievement.service";
import { UsersService } from "../users/users.service";
import { Logger } from "@nestjs/common";

import type { userStat } from "./stats.interface";
import type { GameStatistics, Prisma, UserAchievement } from "@prisma/client";
import type { Achievement } from "../achievement/achievement.interface";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { JwtService } from "@nestjs/jwt";


const findManyResult = [
	[],
	[{ achievementId: 1 }, { achievementId: 17 }],
];
let findManyIndex = 0;

const mockPrisma = {
	gameStatistics: {
		create: (args:Prisma.GameStatisticsCreateArgs):Promise<GameStatistics> =>
			Promise.resolve({...args.data, ID: 1} as GameStatistics),
		createMany: (args):Promise<Prisma.BatchPayload> =>
			Promise.resolve({count: args.data.length} as Prisma.BatchPayload),
		groupBy: ():Promise<Prisma.Prisma__GameStatisticsClient<GameStatistics>[]> =>
			Promise.resolve([]),
		deleteMany: () =>	Promise.resolve()
	},
	userAchievement: {
		findMany: ():Promise<UserAchievement[]|Pick<UserAchievement,"achievementId">[]> =>
			Promise.resolve(findManyResult[findManyIndex++]),
		createMany: ():Promise<void> =>
			Promise.resolve(),
		deleteMany: ():Promise<void> =>
			Promise.resolve()
	}
}

const completeGameUserStats:userStat = {
	bounce:42,
	play_time:42,
	score:100,
	/* block_shot:42, */
	deflect_shot:42,
	max_game_speed:42,
	win: 1,
	loose: 0,
	cascade_bounce: 4,
	classic_pong: 0,
	spatial_pong: 1
}

describe("StatsService (Unit)", () => {
	let statsService:StatsService;
	let achievementService:AchievementService;

	beforeEach(async () => {
		const testingModule = await getTestingModule(
			mockPrisma,
			true,
			{ providers: [StatsService, Logger, UsersService, AchievementService,
				PrismaService, EventEmitter2, JwtService] }
		);
		statsService = testingModule.get<StatsService>(StatsService);
		achievementService = testingModule.get<AchievementService>(AchievementService);
	});


	describe("add Game stats", () => {
		it("should add end game stats and unlock associated achievements", async () => {
			await statsService.bulkAddStats(2, 2, completeGameUserStats);
			const userAchievements = await achievementService.getUserAchievements(2) as Achievement[];

			expect(userAchievements).toBeDefined();
			expect(userAchievements.length).toBe(2);
			expect(userAchievements[0].name).toBe("Beginner");
			expect(userAchievements[1].name).toBe("Space Traveler");
		});

		it("should remove all the user achievement", async () => {
			await achievementService
				.removeAllUserAchievements(2);
			const userAchievements = await achievementService
				.getUserAchievements(2);
			expect(userAchievements).toBeDefined();
			expect(userAchievements.length).toBe(0);
		});

		it("should remove all the user stats", async () => {
			await statsService
				.removeUserStats(2);
			const userStats = await statsService
				.getUserStats(2);
			expect(userStats).toBeDefined();
			expect(JSON.stringify(userStats)).toBe(`{}`);
		});
	});

});