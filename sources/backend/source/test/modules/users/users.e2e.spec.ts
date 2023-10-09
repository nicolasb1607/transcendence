import * as request from 'supertest';
import { expectStatusCode, getTestingNestApp, login } from '../../utils/utils.functions';
import { PrismaError } from '../../utils/utils.class';

import type { Prisma } from '@prisma/client';
import type { User } from '../../../src/modules/users/users.interface';
import type { Message, HttpError } from '../../utils/utils.interfaces';
import type { UserChannel } from "../../../src/modules/chat/chat.interface";
import type { INestApplication } from '@nestjs/common';
import { userTest, userTestDetails, hashPass, adminTest, newUserTest } from '../../utils/mock';
import type { UserMeta } from '@prisma/client';

const userWithoutPassword = {
	login: newUserTest.login,
	email: newUserTest.email,
	role: "user",
}

const userChannelAfterCreation = {
	ID: 1
}

describe('User (e2e). Success tests', () => {
	let app: INestApplication;
	let token:string;
	let findUniqueOrThrowIndex = 0;
	let createdUser;

	beforeAll(async () => {
		
		app = await getTestingNestApp({
			user: {//use newUserTest ?
				findMany: () => 
					Promise.resolve([]),
				upsert: () => 
					Promise.resolve({ ...userWithoutPassword, ID: userTestDetails.ID }),
				findUniqueOrThrow: () => {
					//FindUnique of login
					if ([0, 1].includes(findUniqueOrThrowIndex++)) return (Promise.resolve({...adminTest, ID: 1, password:"$2a$10$SIRCZIP2wU0qAi/V0cHNo..dP2pnNM/qKam73TpDRYaMVfw2DXER6"}));
					return (Promise.resolve({ ...userWithoutPassword, ID: userTestDetails.ID }));
				},
				findFirstOrThrow: () => 
					Promise.resolve({ ...userWithoutPassword, password: hashPass, ID: userTestDetails.ID }),
				findFirst: () =>
					Promise.resolve(undefined),
				update: () => 
					Promise.resolve({ ...userWithoutPassword, ID: userTestDetails.ID })
			},
			userMeta: {
				createMany: ():Promise<UserMeta[]> => Promise.resolve([]),
			},
			userChannel: {
				count: ():Promise<number> => Promise.resolve(10),
				create: (args: Prisma.UserChannelCreateArgs): Promise<UserChannel | never> =>
					Promise.resolve({ ...args.data, ...userChannelAfterCreation } as UserChannel),
			},
		});
		await app.init();
	});

	afterAll(async () => {
		await app.close();
	});

	it('/users (GET). Should return empty array', async () => {
		const response = await request(app.getHttpServer())
			.get('/api/users')
			.expect(200);

		const users: User[]|HttpError = response.body;
		expect(users).toBeInstanceOf(Array);
	});
	
	it('/users (GET). Should return User #1)', async () => {
		const response = await request(app.getHttpServer())
			.get('/api/users/1')
			.expect(200);

		const user: User = response.body;
		expect(user.ID).toEqual(1);
		expect(user.login).toEqual(adminTest.login);
	});

	it('/users (POST). Should create a user', async () => {
		const response = await request(app.getHttpServer())
			.post('/api/users')
			.send(newUserTest);

		expectStatusCode(201, response);
		createdUser = response.body as User;
		expect(createdUser.ID).toBeDefined();
		expect(createdUser.login).toEqual(newUserTest.login);
		expect(createdUser.email).toEqual(newUserTest.email);
		token = await login(app, newUserTest, false);
		console.log(`Token: ${token}`)
	});

	it('/users (PUT). Should update created user', async () => {
		const findFirstResults = [
			{ ...userWithoutPassword, ID: createdUser.ID },
			undefined,
		]
		let findFirstResultsIndex = 0;

		await app.close();
		app = await getTestingNestApp({
			user: {
				findFirst: () =>
					Promise.resolve(findFirstResults[findFirstResultsIndex++]),
				findMany: () => 
					Promise.resolve([{login:"user"}, {login:"user2"}]),
				update: () => 
					Promise.resolve({ login:"aaaa",email:"bddd@gmail.com", ID: createdUser.ID }),
				delete: () =>
					Promise.resolve({ ...userWithoutPassword, ID: userTestDetails.ID })
			},
			userMeta: {
				createMany: ():Promise<UserMeta[]> => Promise.resolve([]),
				findMany: () => 
					Promise.resolve([{login:"user"}, {login:"user2"}]),
			},
			userRelation: {
				findMany: () =>
					Promise.resolve([]),
			}
		});
		await app.init();

		const response = await request(app.getHttpServer())
			.put(`/api/users/${createdUser.ID}`)
			.set('Authorization', `Bearer ${token}`)
			.send({login: "aaaa", email: "bddd@gmail.com"});

		expectStatusCode(200, response);
		const user: User = response.body;
		expect(user.ID).toBe(createdUser.ID);
		expect(user.login).toBe("aaaa");
		expect(user.email).toBe("bddd@gmail.com");
	});

	it('/users (DELETE). Should return an object message deletion success',
		async () => {
			const response = await request(app.getHttpServer())
				.delete(`/api/users/${createdUser.ID}`)
				.set('Authorization', `Bearer ${token}`)
				.expect(200);
			
			const message:Message = response.body;
			expect(message).toEqual({ message: "User deleted successfully." })
		}
	);

	it('/users/search (GET). Should return an array of users with login "user"', async () => {
		const response = await request(app.getHttpServer())
			.get('/api/users/search/user')
			.set('Authorization', `Bearer ${token}`)
			.expect(200);

		const users: User[] = response.body;
		expect(users).toBeInstanceOf(Array);
		expect(users.length).toBeGreaterThan(0);
		for (const user of users) {
			expect(user.login).toContain('user');
		}
	});
});

describe('User (e2e). Fail tests', () => {
	let app: INestApplication;
	console.log(`Following errors are for "User (e2e). Fail tests"`)

	beforeAll(async () => {
		app = await getTestingNestApp({
			user: {
				findFirst: () => Promise.resolve({login:'user2',email:'user2@example.com', ID: 1}),
				delete: () => Promise.reject(new PrismaError("Not Found", 'P2025')),
				update: () => Promise.reject(new PrismaError("Not Found", 'P2025'))
			},
		}, true);
		
		await app.init();
	});

	afterAll(async () => {
		await app.close();
	});

	it('/users (POST). Should return User login already exist', async () => {
		const response = await request(app.getHttpServer())
			.post('/api/users')
			.send({
				login: 'user2',
				email: 'user2@example.com',
				password: 'Password123!'
			})
			.expect(409);

		const user:User|HttpError = response.body;
		if ("ID" in user) {
			throw new Error("response.body is Defined user");
		} else {
			expect(user?.statusCode).toBeDefined();
			expect(user?.message).toBe("User 'login' already exist")
		}
	});

	it('/users (DELETE). Should return UnauthorizedException', async () => {
		const response = await request(app.getHttpServer())
			.delete('/api/users/50')
			.expect(401);
		
		const message:Message|HttpError = response.body;
		if("error" in message) {
			expect(message.statusCode).toBeDefined();
			expect(message.message).toBe("You can't delete this user");
		} else {
			throw new Error("response.body is success Deletion message");
		}
	});

	it('/users (PUT). Should return UnauthorizedException', async () => {

		await app.close();
		app = await getTestingNestApp({
			user: {
				findFirst: () => Promise.resolve(undefined),
				delete: () => Promise.reject(new PrismaError("Not Found", 'P2025')),
				update: () => Promise.reject(new PrismaError("Not Found", 'P2025'))
			},
		}, true);
		
		await app.init();
		const response = await request(app.getHttpServer())
			.put('/api/users/50')
			.send(userTest)
			.expect(401);
		
		const user:User|HttpError = response.body;
		if ("ID" in user) {
			throw new Error("response.body is Defined user");
		} else {
			expect(user?.statusCode).toBeDefined();
			expect(user?.message).toBe("You can't update this user");
		}
	})
	console.log(`End of "User (e2e). Fail tests" errors`)
});
