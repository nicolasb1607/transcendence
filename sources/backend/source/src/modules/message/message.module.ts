import { Logger, Module } from '@nestjs/common';
import { MessageGateway } from './message.gateway';
import { MessageService } from './message.service';
import { ChatService } from '../chat/chat.service';
import { PrismaModule } from '../../common/providers/prisma/prisma.module';
import { UsersService } from '../users/users.service';
import { ChannelActionController } from './channelAction.controller';

@Module({
	imports: [PrismaModule],
	controllers: [ChannelActionController],
	providers: [
		Logger,
		MessageGateway,
		MessageService,
		UsersService,
		ChatService
	],
})
export class MessageModule {}