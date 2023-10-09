import * as request from 'supertest';
import type { INestApplication } from '@nestjs/common';
import { expectStatusCode, getTestingNestApp, login } from "../../utils/utils.functions";
import { io, type Socket } from 'socket.io-client';
import { channelTest, userTest, userTestDetails, mockAuthResponses, adminTest } from '../../utils/mock';

import { UserChannelRole, type Prisma} from '@prisma/client';
import type { Message } from '../../../src/modules/message/message.interface';
import type { DetailedChannel } from '../../../src/modules/chat/chat.interface';
import type { Channel, UserMeta } from '@prisma/client';
import type { Participant, UserDetails } from '../../../src/modules/users/users.interface';
import type { HttpError } from '../../utils/utils.interfaces';
// eslint-disable-next-line @typescript-eslint/no-unused-vars

const channelAfterCreation = {
	ID: 2,
	ownerId: userTestDetails.ID,
	participants: [],
	messages: [],
	createdAt: new Date(),
	image: "test.png",
	password:null
}

const mockupData = {
	user: {
		...mockAuthResponses(userTest),
		findMany: ():Promise<UserDetails[]> =>
			Promise.resolve([userTestDetails]),	
	},
	userMeta: {
		findMany: ():Promise<UserMeta[]> =>
			Promise.resolve([]),
		createMany: ():Promise<UserMeta[]> => Promise.resolve([])
	},
	channel: {
		create: ():Promise<Channel|never> => Promise.resolve({ ...channelTest, ...channelAfterCreation }),
		// get channel before join
		findFirst: ():Promise<Channel|never> => Promise.resolve({ ...channelTest, ...channelAfterCreation }),
		findUniqueOrThrow: ():Promise<Channel|never> => Promise.resolve({ ...channelTest, ...channelAfterCreation }),
		delete: ():Promise<Channel|never> => Promise.resolve({ ...channelTest, ...channelAfterCreation }),
		findUnique: ():Promise<Channel|never> => Promise.resolve({ ...channelTest, ...channelAfterCreation }),
	},
	userChannel: {
		findFirst: () => Promise.resolve([]),
		create: () => Promise.resolve({ ID:0, userId: userTestDetails.ID, channelId: 1, createdAt: new Date(), isConfirmed: true, role: UserChannelRole.admin }),
		count: ():Promise<number> => Promise.resolve(10),
		createMany: ():Promise<void> => Promise.resolve(),
		deleteMany: ():Promise<Prisma.BatchPayload> => Promise.resolve({count:1}),
		findMany: ():Promise<Participant[]> => Promise.resolve([]),
	},
	message: {
		create: ():Promise<Message|never> => Promise.resolve({ ID: 0, content: "Hello World", emitterId: userTestDetails.ID, createdAt: new Date() }),
		findMany: ():Promise<Message[]> => Promise.resolve([]),
		deleteMany: ():Promise<Prisma.BatchPayload> => Promise.resolve({count:1}),
	},
	//return empty Users & Messages
	$queryRaw: ():Promise<Participant[]|Message[]|never> => Promise.resolve([])
}

/**
 * Testing the message module, using sockets
 * @see MessageGateway
 */
describe('Message (e2e)', () => {
	let app: INestApplication;
	let socket: Socket;
	let newChannelId:number;
	let token:string;
	let userId:number;

	beforeAll(async () => {
		app = await getTestingNestApp(mockupData, false);
		await app.listen(3000);
		token = await login(app, adminTest);
	});

	describe("Road map of message sending (Sockets)", () => {

		beforeAll((done) => {
			socket = io(process.env.SOCKET_URL, {
				auth: { token },
				path: '/message',
				transports: ['websocket']
			});

			socket.on('connect', () => {
				console.log('Connected to the server');
				done();
			});

			socket.on('connect_error', (error) => {
				console.error('Connection error:', error);
				expect(socket).toBeTruthy();
				done();
			});
		});

		it('should create a channel', async () => {
			const res = await request(app.getHttpServer())
				.post('/chat/channel')
				.set('Authorization', `Bearer ${token}`)
				.send(channelTest);
				
			expectStatusCode(201, res);
			newChannelId = res.body.ID;
			expect(res.body).toHaveProperty("name", channelTest.name);
			expect(res.body).toHaveProperty("type", channelTest.type);
			expect(parseInt(res.body.ownerId)).toBeGreaterThan(0);
			userId = parseInt(res.body.ownerId);
			expect(Array.isArray(res.body.participants)).toBeTruthy();
			expect(res.body).toHaveProperty("messages", []);
		});

		it("should join the created channel", (done: jest.DoneCallback) => {
			socket.emit("join", {
				channelId: newChannelId,
			});
			//stop listening after first message
			socket.once("channel", (channel: DetailedChannel) => {
				expect(channel).toHaveProperty("ID", newChannelId);
				expect(channel).toHaveProperty("name", channelTest.name);
				expect(channel).toHaveProperty("type", channelTest.type);
				expect(Array.isArray(channel.participants)).toBeTruthy();
				expect(Array.isArray(channel.messages)).toBeTruthy();
				done();
			});
		});

		it('should send a message', (done: jest.DoneCallback) => {
			socket.emit("message", {
				content: "Hello World",
				channelId: newChannelId,
			});
			socket.on("message", (message: Message) => {
				expect(message).toHaveProperty("content", "Hello World");
				expect(message).toHaveProperty("emitterId", userId);
				expect(message).toHaveProperty("ID");
				done();
			});
		});

		it("should throw an error (Missing recipient)", (done: jest.DoneCallback) => {
			socket.emit("message", {
				content: "ABCD",
			});
			socket.once("exception", (error:HttpError) => {
				expect(error.message).toBe('An error occured while sending the message');
				expect(error.statusCode).toBe(500);
				done();
			});
		});

		it('should delete a channel', async () => {
			const res = await request(app.getHttpServer())
				.delete(`/chat/channel/${newChannelId}`)
				.set('Authorization', `Bearer ${token}`)
				.expect(200);

			expect(res.body).toHaveProperty("message", "Channel deleted successfully.");
		});

		afterAll(async () => {
			if (socket.connected) {
				socket.disconnect();
			}
		});

	});

	describe("Unsigned Actions", () => {
		beforeAll((done) => {
			socket = io(process.env.SOCKET_URL,{
				path: '/message',
				auth: {
					undefined,
				},
				transports: ['websocket']
			});
	
			socket.on('connect', () => {
				console.log('Connected to the server');
				done();
			});
			
			socket.on('connect_error', (error) => {
				console.error('Connection error:', error);
				expect(socket).toBeTruthy();
				done();
			});
		});

		it("should throw an error (Unauthorized)", (done:jest.DoneCallback) => {
			socket.emit("join", {
				channelId: 1,
			});
			socket.once("exception", (error:HttpError) => {
				expect(error.message).toBe("Invalid credentials");
				expect(error.statusCode).toBe(401);
				done();
			});
		});

		afterAll(async () => {
			if (socket.connected) {
				socket.disconnect();
			}
		});
	});

	afterAll(async () => {
		await app.close();
	});
});
