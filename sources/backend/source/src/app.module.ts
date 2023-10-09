import { Module  } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { join } from 'path';
import { UsersModule } from './modules/users/users.module';
import { PrismaModule } from './common/providers/prisma/prisma.module';
import { ChatModule } from './modules/chat/chat.module';
import { MessageModule } from './modules/message/message.module';
import { AuthModule } from './modules/auth/auth.module';
import { AuthGuard } from './modules/auth/auth.guard';
import { GameModule } from './modules/game/game.module';
import { RelationsModule } from './modules/relations/relations.module';
import { TwoFAModule } from './modules/auth/twoFA/twoFA.module';
import { UploadModule } from './modules/upload/upload.module';

@Module({
	imports: [
		ServeStaticModule.forRoot({
			rootPath: join(__dirname, '../../', 'client'),
			renderPath: /^(?!\/api\/).*/
		}),
		ThrottlerModule.forRoot({
			ttl: 60,
			limit: 40,
		}),
		EventEmitterModule.forRoot(),
		PrismaModule,
		UsersModule,
		ChatModule,
		MessageModule,
		AuthModule,
		GameModule,
		RelationsModule,
		TwoFAModule,
		UploadModule
	],
	providers: [
		{
			provide: APP_GUARD,
			useExisting: AuthGuard,
		},
		{
			provide: APP_GUARD,
			useClass: ThrottlerGuard
		},
		AuthGuard
	],
})
export class AppModule {}
