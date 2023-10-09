// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as request from 'supertest';
import { UnauthorizedException, type INestApplication } from '@nestjs/common';
import { expectStatusCode, getTestingNestApp, login } from "../../utils/utils.functions";

import type { Message, Prisma, UserMeta } from '@prisma/client';
import { userLogin, userTest, userTestDetails, channelTest, mockAuthResponses, channelUpdate, protectedChannelTest } from '../../utils/mock';
import type { Channel } from "../../../src/modules/chat/chat.interface";

const channelAfterCreation = {
	ID: 1,
	ownerId: userTestDetails.ID,
}

/**
 * Testing the chat module.
 * @see ChatController
 */
describe('Chat (e2e)', () => {
	let app: INestApplication;
	let token:string;
	let findUniqueOrThrowIndex = 0;
	let findManyIndex = 0;
	let userFindManyIndex = 0;

	beforeAll(async () => {
		app = await getTestingNestApp({
			userMeta: {
				findMany: ():Promise<UserMeta[]> =>
					Promise.resolve([]),
				createMany: ():Promise<UserMeta[]> => Promise.resolve([])
			},
			user: {
				...mockAuthResponses(userTest),
				findMany: () =>
					Promise.resolve(
						userFindManyIndex++ <= 2 ? [userTestDetails] : [{},{},{},{},{},{},{},{},{},{}]
					),
			},
			channel: {
				create: (args:Prisma.ChannelCreateArgs):Promise<Channel|never> => 
					Promise.resolve({...args.data, ...channelAfterCreation} as Channel),
				findMany: ():Promise<Channel[]> =>
					Promise.resolve([{...channelTest, ...channelAfterCreation} as Channel]),
				findFirst: ():Promise<Channel|null> =>
					Promise.resolve({...channelTest, ...channelAfterCreation} as Channel),
				findUniqueOrThrow: ():Promise<Channel> => {
					if (findUniqueOrThrowIndex++ === 0) return (Promise.resolve({...channelTest, ...channelAfterCreation, type:"general"} as Channel));
					return (Promise.resolve({...channelTest, ...channelAfterCreation, } as Channel));
				},
				delete: ():Promise<void> =>
					Promise.resolve(),
				update: (args:Prisma.ChannelUpdateArgs):Promise<Channel> => {
					if (args.where.ID === 4) {
						throw new UnauthorizedException("You cannot update this channel", "UnauthorizedError");
					}
					return (Promise.resolve({...args.data, ...channelAfterCreation} as Channel));
				}
			},
			userChannel: {
				count: ():Promise<number> => Promise.resolve(10),
				createMany: ():Promise<void> => Promise.resolve(),
				findMany: () => Promise.resolve(
					findManyIndex++ <= 1 ? [] : [{},{},{},{},{},{},{},{},{},{}]
				),
				deleteMany: ():Promise<void> => Promise.resolve(),
			},
			message: {
				findMany: ():Promise<Message[]> => Promise.resolve([]),
				deleteMany: ():Promise<void> => Promise.resolve()
			}
		}, false);
		await app.init();
		token = await login(app, userLogin, false);
	});

	afterAll(async () => {
		await app.close();
	});

	let newChannelId:number;
	let currentUserId:number;
	
	it('should create a channel', async () => {
		const res = await request(app.getHttpServer())
			.post('/chat/channel')
			.set('Authorization', `Bearer ${token}`)
			.send(channelTest)
			.expect(201);

		newChannelId = res.body.ID;
		console.log("newChannelId: " + newChannelId)
		expect(res.body).toHaveProperty("name", channelTest.name);
		expect(res.body).toHaveProperty("type", channelTest.type);
		expect(res.body.ownerId).toBeGreaterThan(0);
		currentUserId = res.body.ownerId;
		expect(Array.isArray(res.body.participants)).toBe(true);
		expect(res.body).toHaveProperty("messages", []);
		expect(newChannelId).toBeGreaterThan(0);
	});

	it('should get the Main channel', async () => {
		const res = await request(app.getHttpServer())
			.get('/chat/channel/1')
			.set('Authorization', `Bearer ${token}`)
			.expect(200)

		expect(res.body.name).toBeDefined();
		expect(res.body).toHaveProperty("type", "general");
		expect(Array.isArray(res.body.participants)).toBe(true);
		expect(Array.isArray(res.body.messages)).toBe(true);
	});

	it('should get a channel by its id', async () => {
		const res = await request(app.getHttpServer())
			.get(`/chat/channel/${newChannelId}`)
			.set('Authorization', `Bearer ${token}`)
			.expect(200);

		expect(res.body).toHaveProperty("name", channelTest.name);
		expect(res.body).toHaveProperty("type", channelTest.type);
		expect(res.body).toHaveProperty("ownerId", currentUserId);
		expect(Array.isArray(res.body.participants)).toBe(true);
		expect(res.body).toHaveProperty("messages", []);
	});

	it('should update a channel', async () => {
		const res = await request(app.getHttpServer())
			.put(`/chat/channel/${newChannelId}`)
			.set('Authorization', `Bearer ${token}`)
			.send(channelUpdate)
			.expect(200);
		
		expect(res.body.name).toBe("Space Pong team 2");
		expect(Array.isArray(res.body.participants)).toBe(true);
		expect(Array.isArray(res.body.messages)).toBe(true);
	});

	it("should get updated channel with new participants", async () => {
		const res = await request(app.getHttpServer())
			.get(`/chat/channel/${newChannelId}/participants`)
			.set('Authorization', `Bearer ${token}`)
			.expect(200);

		expect(res.body.length).toBeGreaterThan(6);
	});

	it("should not update a channel (Not Owner)", async () => {
		const res = await request(app.getHttpServer())
			.put(`/chat/channel/4`)
			.set('Authorization', `Bearer ${token}`)
			.send(channelUpdate)
			.expect(401);

		expect(res.body).toHaveProperty("message", "You cannot update this channel");
	});

	if (process.env.USE_DATABASE === "true") {
		it('should get a list of private channels by user id', async () => {
			

			const res = await request(app.getHttpServer())
				.get(`/chat/channel/privateChannels/${currentUserId}`)
				.set('Authorization', `Bearer ${token}`)
				.expect(200);

			const channels = res.body;
			for (const channel of channels) {
				expect(channel).toHaveProperty("type", "conversation");
				expect(Array.isArray(channel.participants)).toBeTruthy();
				expect(Array.isArray(channel.messages)).toBeTruthy();
			}
		});
	}

	it('should delete a channel', async () => {
		const res = await request(app.getHttpServer())
			.delete(`/chat/channel/${newChannelId}`)
			.set('Authorization', `Bearer ${token}`)
			.expect(200);

		expect(res.body).toHaveProperty("message", "Channel deleted successfully.");
	});

	if (process.env.USE_DATABASE){
		it('should get all channels by user', async () => {
			const res = await request(app.getHttpServer())
				.get('/chat/channel/user/2')
				.set('Authorization', `Bearer ${token}`)
				.expect(200);

			expect(res.body.length).toBeGreaterThan(2);
			expect(res.body[0].name).toBeDefined();
			for (const channel of res.body) {
				expect(channel.isMember).toBeTruthy();
			}
		});
	}

	if (process.env.USE_DATABASE === "true") {

		it('should get or create a private channel between two users', async () => {
			const emitterId = currentUserId;
			const recipientId = 9;
			const channelName = "Private Canal " + emitterId + " " + recipientId;
			const res = await request(app.getHttpServer())
				.get(`/chat/channel/private/${emitterId}`)
				.query({ recipientId })
				.set('Authorization', `Bearer ${token}`);

			expectStatusCode(200, res);
			expect(res.body).toHaveProperty("name", channelName);
			expect(res.body).toHaveProperty("type", "conversation");
		});

		it('should get all channels by user', async () => {
			const res = await request(app.getHttpServer())
				.get('/chat/channel/user/2')
				.set('Authorization', `Bearer ${token}`)
				.expect(200);

			expect(res.body.length).toBeGreaterThan(2);
			expect(res.body[0].name).toBeDefined();
			for (const channel of res.body) {
				expect(channel.isMember).toBeTruthy();
			}
		});
	}
});

if (process.env.USE_DATABASE === "true") {

	describe('Chat ADMIN', () => {
		let app: INestApplication;
		let token:string;

		beforeAll(async () => {
			app = await getTestingNestApp({}, false);
			await app.init();
			token = await login(app, userTest);
		});

		afterAll(async () => {
			await app.close();
		});

		let newChannelId:number;
		
		it('should create a channel', async () => {
			const res = await request(app.getHttpServer())
				.post('/chat/channel')
				.set('Authorization', `Bearer ${token}`)
				.send({
					...protectedChannelTest,
					participants: [4, 5, 6, 7, 8, 9]
				})
				.expect(201);

			newChannelId = res.body.ID;
			console.log("newChannelId: " + newChannelId)
			expect(res.body).toHaveProperty("name", protectedChannelTest.name);
			expect(res.body).toHaveProperty("type", protectedChannelTest.type);
			expect(res.body.ownerId).toBeGreaterThan(0);
			expect(Array.isArray(res.body.participants)).toBe(true);
			expect(Array.isArray(res.body.messages)).toBe(true);
		});

		it('should changer userRole to admin', async () => {
			const targetUserId = 4;
			const role = "user"
			const res = await request(app.getHttpServer())
				.get(`/chat/action/changeRole/${newChannelId}`)
				.query( {  targetUserId, role })
				.set('Authorization', `Bearer ${token}`)
			
			expectStatusCode(200, res);
			expect(res.body).toHaveProperty("message", "User role changed successfully.");
		});

		it('should mute user from a channel', async () => {
			const targetUserId = 4;
			const role = "user"
			const res = await request(app.getHttpServer())
				.get(`/chat/action/muteUser/${newChannelId}`)
				.query( { targetUserId, role })
				.set('Authorization', `Bearer ${token}`)
			
			expectStatusCode(200, res);
			expect(res.body).toHaveProperty("message", "User muted successfully.");
		});

		it('should ban user from a channel', async () => {
			const targetUserId = 4;
			const role = "user"
			const res = await request(app.getHttpServer())
				.get(`/chat/action/banUser/${newChannelId}`)
				.query( { targetUserId, role })
				.set('Authorization', `Bearer ${token}`)
			
			expectStatusCode(200, res);	
			expect(res.body).toHaveProperty("message", "User banned successfully.");
		});

		/* it('should kick user from a channel', async () => {
			const channelId = 3;
			const targetUserId = 4;
			const role = "user"
			const res = await request(app.getHttpServer())
				.get(`/chat/channel/kickUser/${channelId}`)
				.query( { targetUserId, role })
				.set('Authorization', `Bearer ${adminToken}`)
				.expect(200);
				
			expect(res.body).toHaveProperty("message", "User kicked successfully.");
		}); */

		it('should access a protected channel', async () => {
			const password = 'jesuisunmotdepasse';
			const res = await request(app.getHttpServer())
				.get(`/chat/channel/${newChannelId}/join`)
				.query({ password })
				.set('Authorization', `Bearer ${token}`)
			
			expectStatusCode(200, res);
			expect(res.body.message).toBe("Channel joined successfully.");

		})

		it('should delete a channel', async () => {
			console.log("newPrivateChannelId: " + newChannelId);
			const res = await request(app.getHttpServer())
				.delete(`/chat/channel/${newChannelId}`)
				.set('Authorization', `Bearer ${token}`);

			expectStatusCode(200, res);
			expect(res.body).toHaveProperty("message", "Channel deleted successfully.");
		});
	});
}

describe('Chat (e2e) - Error cases', () => {
	let app: INestApplication;
	let token:string;

	beforeAll(async () => {
		app = await getTestingNestApp({
			channel: {
				create: (args:Prisma.ChannelCreateArgs):Promise<Channel|never> => 
					Promise.resolve({...args.data, ID: 1} as Channel),
			},
			user: mockAuthResponses(userTest),
			userMeta: {
				createMany: ():Promise<UserMeta[]> => Promise.resolve([])
			}
		});
		await app.init();
		token = await login(app, userLogin, false);
	});

	afterAll(async () => {
		await app.close();
	});

	it('should not create a channel (Missing type)', async () => {
		const res = await request(app.getHttpServer())
			.post('/chat/channel')
			.set('Authorization', `Bearer ${token}`)
			.send({name: "Main Channel"})
			.expect(400);

		expect(res.body.message[0]).toBe("type must be a string");
	});

	it("should not create a channel (Invalid name)", async () => {
		const res = await request(app.getHttpServer())
			.post('/chat/channel')
			.set('Authorization', `Bearer ${token}`)
			.send({name: "A", type: "general"})
			.expect(400);

		expect(res.body.message[0]).toBe("name must be longer than or equal to 3 characters");
	});

	it("should not create a channel (Missing Permission)", async () => {
		const res = await request(app.getHttpServer())
			.post('/chat/channel')
			.set('Authorization', `Bearer ${token}`)
			.send({name: "Main Channel", type: "general", image: "test.jpg"})
			.expect(401);

		expect(res.body.message).toBe("You cannot create a general channel");
	});
});