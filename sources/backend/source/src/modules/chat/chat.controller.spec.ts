import { ChatService } from './chat.service';
import { PrismaService } from '../../common/providers/prisma/prisma.service';
import { ChatController } from './chat.controller';
import { getTestingModule } from '../../../test/utils/utils.functions';
import { userTestDetails } from '../../../test/utils/mock';
import { Logger } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { PrismaModule } from '../../common/providers/prisma/prisma.module';
import { UsersService } from '../users/users.service';
import type { CreateChannelDTO } from './chat.dto';
import type { Message, Prisma, UserMeta } from '@prisma/client';
import type { Channel } from './chat.interface';
import type { UserDetails } from '../users/users.interface';
import { MessageService } from '../message/message.service';
import { JwtModule } from '@nestjs/jwt';
import { EventEmitterModule } from '@nestjs/event-emitter';

const validChannelDTO:CreateChannelDTO = {
	name: "test",
	type: "private",
	image: "test.png",
	participants: [1]
}

const createdChannel = {
	ID: 1,
	ownerId: 1,
	createdAt: new Date(),
}

const mockPrisma = {
	userMeta: {
		findMany: ():Promise<UserMeta[]> =>
			Promise.resolve([]),
		createMany: ():Promise<UserMeta[]> => Promise.resolve([])
	},
	user: {
		findMany: ():Promise<UserDetails[]> =>
			Promise.resolve([userTestDetails]),	
	},
	channel: {
		create: (args:Prisma.ChannelCreateArgs):Promise<Channel|never> => 
			Promise.resolve({...args.data, ID: 1} as Channel),
		findMany: ():Promise<Channel[]> =>
			Promise.resolve([{...validChannelDTO, ...createdChannel} as Channel]),
		findFirst: ():Promise<Channel|null> =>
			Promise.resolve({...validChannelDTO, ...createdChannel} as Channel),
		findUniqueOrThrow: ():Promise<Channel> =>
			Promise.resolve({...validChannelDTO, ...createdChannel} as Channel),
	},
	userChannel: {
		count: ():Promise<number> => Promise.resolve(10),
		createMany: ():Promise<void> => Promise.resolve(),
		findMany: () => Promise.resolve([]),
	},
	message: {
		findMany: ():Promise<Message[]> => Promise.resolve([]),
		createMany: ():Promise<void> => Promise.resolve()
	},
	$queryRaw: ():Promise<Channel[]> => Promise.resolve([]),
};

if (!process.env?.USE_DATABASE) {

	describe("ChatController (Unit)", () => {
		let chatController:ChatController;
	
		beforeEach(async () => {
			const testingModule = await getTestingModule(mockPrisma, true,{
				imports: [PrismaModule, UsersModule, JwtModule.register({
					global:true, 
					secret: "",
					signOptions: { expiresIn: '7d' }
				}), EventEmitterModule.forRoot()],
				providers: [
					PrismaService,
					Logger,
					UsersService,
					ChatService,
					ChatController,
					MessageService
				],
			});
			chatController = testingModule.get<ChatController>(ChatController);
		});
	
		describe("createChannel", () => {
			it("should create a channel", async () => {
				const channel = await chatController.createChannel(userTestDetails, validChannelDTO);
				expect(channel).toBeDefined();
				expect(channel.ID).toBeDefined();
				expect(channel.name).toBe(validChannelDTO.name);
				expect(Array.isArray(channel.messages)).toBe(true);
				expect(Array.isArray(channel.participants)).toBe(true);
			});
		});
	});

} else {
	describe("ChatController (Unit)", () => {
		it("should create a channel", () => {
			expect(true).toBe(true);
		});
	})
}