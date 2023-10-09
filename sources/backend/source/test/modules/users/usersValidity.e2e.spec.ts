import * as request from 'supertest';
import { getTestingNestApp } from "../../utils/utils.functions";

import type { Prisma } from '@prisma/client';
import type { INestApplication } from "@nestjs/common";
import type { User } from "../../../src/modules/users/users.interface";
import type { UserChannel } from "../../../src/modules/chat/chat.interface";
import type { HttpError } from "../../utils/utils.interfaces";
import type { CreateUserDTO } from '../../../src/modules/users/users.dto';

const userWithoutPassword = {
	login: 'JohnDoe',
	email: 'johndoe@gmail.com',
}

const userBadLogin:CreateUserDTO = {
	login: "ggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg",
	email: "emailtest123456@gmail.com",
	password: "StrongPassword123456!"
}

const userBadEmail:CreateUserDTO = {
	login: "testlogin",
	email: "emailtegmail.com",
	password: "StrongPassword123456!"
}

const userBadPassword:CreateUserDTO = {
	login: "testlogin",
	email: "emailtest123456@gmail.com",
	password: "badPassword123456"
}

const userChannelAfterCreation = {
	ID: 1
}

describe("User Creation - Field validity (e2e)", () => {
	let app : INestApplication;

	beforeEach(async () => {

		app = await getTestingNestApp({
			user : {
				upsert: () =>
					Promise.resolve({ ...userWithoutPassword, ID: 1 }),
				findUniqueOrThrow: () =>
					Promise.resolve({ ...userWithoutPassword, ID: 1 }),
				findFirst: () =>
					Promise.resolve(undefined),
				update: () =>
					Promise.resolve({ ...userWithoutPassword, ID: 1 }),
				delete: () =>
					Promise.resolve()
			},
			userChannel: {
				count: ():Promise<number> => Promise.resolve(10),
				create: (args: Prisma.UserChannelCreateArgs): Promise<UserChannel | never> =>
					Promise.resolve({ ...args.data, ...userChannelAfterCreation } as UserChannel),
			},
		}, true);
		await app.init();
	})

	afterEach(async () => {
		await app.close();
	});


	it("should return an error on user login", async () => {
		const response = await request(app.getHttpServer())
			.post('/api/users')
			.send(userBadLogin)
			.expect(400);

		const user: User|HttpError = response.body;
		if ("ID" in user) {
			throw new Error("response.body is created a user");
		} else {
			expect(user?.statusCode).toBeDefined();
			expect(user?.message[0]).toEqual("login must be shorter than or equal to 20 characters")
		}
	});

	it("should return an error on user login", async () => {
		const response = await request(app.getHttpServer())
			.post('/api/users')
			.send(userBadEmail)
			.expect(400);

		const user: User|HttpError = response.body;
		if ("ID" in user) {
			throw new Error("response.body is created a user");
		} else {
			expect(user?.statusCode).toBeDefined();
			expect(user?.message[0]).toEqual('email must be an email')
		}
	});

	it("should return an error on user login", async () => {
		const response = await request(app.getHttpServer())
			.post('/api/users')
			.send(userBadPassword)
			.expect(400);

		const user: User|HttpError = response.body;
		if ("ID" in user) {
			throw new Error("response.body is created a user");
		} else {
			expect(user?.statusCode).toBeDefined();
			expect(user?.message[0]).toEqual("password must match /[!@#$%^&*?_~]/ regular expression")
		}
	});

})
