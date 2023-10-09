import { getTestingModule } from "../../../test/utils/utils.functions";
import { PrismaService } from '../../common/providers/prisma/prisma.service';
import { AchievementService } from "./achievement.service";
import * as achievementsData from './achievements.json';

import type { UserAchievement } from "@prisma/client";
import type { Achievement } from "./achievement.interface";
import { Logger } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";

const findManyResult = [
	[],
	[],
	[{ achievementId: 1 }],
	[],
];
let findManyIndex = 0;

const mockPrisma = {
	userAchievement: {
		findMany: ():Promise<UserAchievement[]|Pick<UserAchievement,"achievementId">[]> =>
			Promise.resolve(findManyResult[findManyIndex++]),
		createMany: ():Promise<void> =>
			Promise.resolve(),
		deleteMany: ():Promise<void> =>
			Promise.resolve()
	}
};

/**
 * We assume in this test, User 2 is defined
 * with no achievements
 */
describe("AchievementService (Unit)", () => {
	let achievementService:AchievementService;

	beforeEach(async () => {
		const testingModule = await getTestingModule(
			mockPrisma,
			true,
			{ providers: [AchievementService, PrismaService, Logger, EventEmitter2] }
		);
		achievementService = testingModule.get<AchievementService>(AchievementService);
	});

	describe("Achievement through new Stat event", () => {
		it("should not add any achievement", async () => {
			const achievementIds = await achievementService
				.handleStatisticAchievement(1, "score", 50);
			expect(achievementIds).toBe(null);
		});

		it("should add a Beginner achievement", async () => {
			const achievementIds = await achievementService
				.handleStatisticAchievement(2, "score", 100);
			expect(achievementIds).toBeDefined();
			expect(achievementIds).toContain(1);
		});

		it("should have only the  Beginner achievement", async () => {
			const userAchievements = await achievementService
				.getUserAchievements(2) as Achievement[];
			expect(userAchievements).toBeDefined();
			expect(userAchievements.length).toBe(1);
			expect(userAchievements[0].name).toBe("Beginner");
		});

		it("should remove the Beginner achievement", async () => {
			await achievementService
				.removeAllUserAchievements(2);
			const userAchievements = await achievementService
				.getUserAchievements(2);
			expect(userAchievements).toBeDefined();
			expect(userAchievements.length).toBe(0);
		});
	});

	if (process.env.USE_DATABASE){
		describe("Achievement through mockData.sql", () => {
			
			it("should have more than 3 achievements", async () => {
				const achievements = await achievementService.getUserAchievements(1) as Achievement[];
				const GalacticTraveler = achievements.find((achievement) => achievement.id === 19);

				expect(achievements.length).toBeGreaterThan(3);
				expect(GalacticTraveler).toBeDefined();
				expect(GalacticTraveler?.name).toBe(achievementsData.badges[18].name);
			});
		})
	}
});