import { Logger, Module } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { PrismaModule } from '../../common/providers/prisma/prisma.module';
import { GameGateway } from './game.gateway';
import { GameService } from './service/game.service';
import { PrismaService } from '../../common/providers/prisma/prisma.service';
import { GameStatsService } from './service/gameStats.service';
import { StatsService } from '../stats/stats.service';
import { AchievementService } from '../achievement/achievement.service';

@Module({
	imports: [PrismaModule],
	providers: [
		Logger,
		PrismaService,
		UsersService,
		AchievementService,
		StatsService,
		GameStatsService,
		GameService,
		GameGateway
	],
	exports: [GameService]
})
export class GameModule {}