import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import type { UserDetails } from "../../modules/users/users.interface";
import type { Socket } from "socket.io";
import type { JWTData } from "../../modules/auth/auth.interface";

export const AuthUser = createParamDecorator<
	keyof UserDetails | undefined,
	ExecutionContext
>(
	(data, ctx) => {
		const contextType = ctx.getType();
		let user:JWTData|undefined = undefined;
		if (contextType === 'http') {
			const request = ctx.switchToHttp().getRequest()
			user = request?.user
		} else {
			const client = ctx.switchToWs().getClient<Socket>()
			user = client.data?.user
		}
		if (typeof data === 'undefined') return (user);
		return (user[data]);
	}
)