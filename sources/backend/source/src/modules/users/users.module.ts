import { Logger, Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaModule } from '../../common/providers/prisma/prisma.module';
import { AchievementService } from '../achievement/achievement.service';
import { RelationsService } from '../relations/relations.service';
import { StatsService } from '../stats/stats.service';
import { UserGateway } from './user.gateway';
import { GameModule } from '../game/game.module';
import { UserChallengeService } from './userChallenge.service';


/**
 * Provides the users module.
 * Handle user creation, update, deletion and listing.
 */
@Module({
	imports: [
		PrismaModule,
		GameModule
	],
	controllers: [UsersController],
	providers: [
		UsersService,
		UserChallengeService,
		UserGateway,
		AchievementService,
		Logger,
		RelationsService,
		StatsService,
	],
	exports: [UsersService]
})
export class UsersModule {}
