import * as request from 'supertest';
import { getTestingNestApp, login } from '../../utils/utils.functions';
import { adminTest, newUserTest, channelTest, mockAuthResponses, userTestDetails } from '../../utils/mock';
import type { INestApplication } from '@nestjs/common';
import type { Channel } from '../../../src/modules/chat/chat.interface';
import type { UserDetails } from '../../../src/modules/users/users.interface';
import type { UserMeta } from '@prisma/client';
import type { ApiToken } from 'src/modules/auth/auth.interface';
import jwt_decode from 'jwt-decode';
import type { Message, UserRole } from '@prisma/client';


describe('AuthController (e2e)', () => {
	let app: INestApplication;

	beforeAll(async () => {
		app = await getTestingNestApp({
			user: {
				...mockAuthResponses(newUserTest),
				delete: () =>
					Promise.resolve()
			},
			userMeta: {
				createMany: ():Promise<UserMeta[]> => Promise.resolve([])
			}
			
		}, false);
		await app.init();
	});

	afterAll(async () => {
		await app.close();
	});

	it("/auth/login (POST) - should return a token", async () => {
		const token = await login(app, adminTest, false);

		expect(token).toBeDefined();
		expect(token).toMatch(/^[a-zA-Z0-9-_]+\.[a-zA-Z0-9-_]+\.[a-zA-Z0-9-_]+$/);
	});
});

describe('Access Protected route through Token', () => {
	let app: INestApplication;
	let token: string;

	beforeAll(async () => {
		app = await getTestingNestApp({
			userMeta: {
				findMany: ():Promise<UserMeta[]> =>
					Promise.resolve([]),
				createMany: ():Promise<UserMeta[]> => Promise.resolve([])
			},
			user: {
				...mockAuthResponses(newUserTest),
				findMany: ():Promise<UserDetails[]> =>
					Promise.resolve([userTestDetails]),	
			},
			channel: {
				findUniqueOrThrow: ():Promise<Channel|null> =>
					Promise.resolve({...channelTest, ID: 1, ownerId:1, type:"general"} as Channel),
			},
			userChannel: {
				count: ():Promise<number> => Promise.resolve(10),
				findMany: () => Promise.resolve([]),
			},
			message: {
				findMany: ():Promise<Message[]> => Promise.resolve([])
			}
		});
		await app.init();
		token = await login(app, adminTest);
		expect(token).toBeDefined();
	});

	afterAll(async () => {
		await app.close();
	});

	it('should get the Main channel', async () => {
		const res = await request(app.getHttpServer())
			.get('/chat/channel/1')
			.set('Authorization', `Bearer ${token}`)
			.expect(200);

		expect(res.body.name).toBeDefined();
		expect(res.body).toHaveProperty("type", "general");
		expect(Array.isArray(res.body.participants)).toBe(true);
		expect(Array.isArray(res.body.messages)).toBe(true);
	});

	
});

describe('AuthController (e2e)', () => {
	let app: INestApplication;

	beforeAll(async () => {
		app = await getTestingNestApp({
			user: {
				...mockAuthResponses(newUserTest),
				delete: () =>
					Promise.resolve()
			},
			userMeta: {
				createMany: ():Promise<UserMeta[]> => Promise.resolve([]),
			}
		}, false);
		await app.init();
	});

	afterAll(async () => {
		await app.close();
	});

	it('Should create a new user and return a valid token', async () => {
		let response = await request(app.getHttpServer())
			.post('/api/auth/register')
			.send(newUserTest)
			.expect(200);
	
		const createdUser = response.body as ApiToken;
		expect(createdUser.accessToken).toBeDefined();
		const decoded = jwt_decode< {ID: number, login: string, role:UserRole}>(createdUser.accessToken);
		response = await request(app.getHttpServer())
			.delete(`/api/users/${decoded.ID}`)
			.set('Authorization', `Bearer ${createdUser.accessToken}`)
			.expect(200)
		
		const message:Message = response.body;
		expect(message).toEqual({ message: "User deleted successfully." })
		
	});
});

