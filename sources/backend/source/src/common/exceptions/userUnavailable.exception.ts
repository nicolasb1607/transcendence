import type { UserStatus } from '@prisma/client';
import { NotFoundException } from "@nestjs/common";

export class UserUnavailableException extends NotFoundException {
	constructor(
		private readonly login: string,
		private readonly userStatus: UserStatus
	) {
		super(`${login} is ${userStatus}`, {
			cause: new Error(`${login} is now ${userStatus}`),
			description: 'UserUnavailable'
		});
	}
}