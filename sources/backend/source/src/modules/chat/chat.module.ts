import { Logger, Module } from '@nestjs/common';
import { PrismaModule } from '../../common/providers/prisma/prisma.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { MessageService } from '../message/message.service';
import { UsersService } from '../users/users.service';

@Module({
	imports: [PrismaModule],
	controllers: [ChatController],
	providers: [
		UsersService,
		ChatService,
		MessageService,
		Logger
	],
})
export class ChatModule {}
