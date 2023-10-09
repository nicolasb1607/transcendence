import { UserStatus } from "@prisma/client";
import type { CreateUserDTO } from "../../src/modules/users/users.dto";
import type { UserDetails } from "../../src/modules/users/users.interface";

export const adminTest = {
	login: 'Baptiste',
	email: 'bboisset@student.42.fr',
	password: 'Password123!',
	role: 'admin',
};

export const hashPass = "$2a$10$SIRCZIP2wU0qAi/V0cHNo..dP2pnNM/qKam73TpDRYaMVfw2DXER6";

export const adminTestDetails = {
	password: hashPass,
	ID: 1,
}

export const userLogin = {
	login: 'user2',
	password: 'Password123!',
	email: 'user2@example.com'
}

//Shouldn't be used for login purposes
export const userTest = {
	login: 'user2b',
	email: 'user2b@example.com',
	password: 'Password123!'
}

export const newUserTest = {
	login: 'user2x',
	email: 'user2x@example.com',
	password: 'Password123!'
}

export const userTestDetails:UserDetails = {
	...userTest,
	ID: 6,
	role: 'user',
	avatar: '',
	experience: {
		level: 0,
		exp: 0
	},
	status: UserStatus.offline,
}

export const userTestPrivate = {
	login: 'user8',
	email: 'user8@example.com',
	password: 'Password123!'
}

export const userTestPrivateDetails = {
	...userTest,
	ID: 8,
	role: 'admin',
	avatar: '',
	email: 'user8@example.com',
	experience: {
		level: 0,
		exp: 0,
	},
	status: UserStatus.offline,
}
export const channelTest = {
	name: 'Private Canal',
	type: 'conversation',
	ownerId: 1,
	createdAt: new Date(),
	image: 'test.jpg',
	password: null,
	participants: [1],
}

export const protectedChannelTest = {
	name: 'Private Canal',
	type: 'protected',
	createdAt: new Date(),
	password: 'jesuisunmotdepasse',
	image: 'test.jpg',
	participants: [1]
}

export const userChannelTest = {
	userId: 1,
	channelId: 3,
	role: 'user',
	createdAt:  new Date(),
	image: 'test.jpg'
}

export const channelUpdate = {
	name: "Space Pong team 2",
	type: "public",
	image: "red_sheeps.jpg",
	participants: [2, 3, 6, 8, 9, 5]
}

// Mocking the auth module to avoid having to login
export const mockAuthResponses =  (user?:CreateUserDTO, hashPass?:string) => {
	user = user || adminTest;
	hashPass = hashPass || "$2a$10$SIRCZIP2wU0qAi/V0cHNo..dP2pnNM/qKam73TpDRYaMVfw2DXER6";
	return ({
		findFirst: () => Promise.resolve(undefined),
		upsert: () => Promise.resolve({ ...user, ID: 1 }),
		findFirstOrThrow: () =>
			Promise.resolve({
				...user,
				ID: 1,
				password: hashPass
			})
	})
}
