import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from "@nestjs/jwt";
import { IS_PUBLIC_KEY, jwtConstants } from "./constants";
import type { CanActivate, ExecutionContext } from "@nestjs/common";
import type { Request } from "express";
import type { Socket } from 'socket.io';
import { WsException } from '@nestjs/websockets';


@Injectable()
export class AuthGuard implements CanActivate {

	private logger = new Logger(AuthGuard.name);

	constructor(
		private jwtService: JwtService,
		private reflector : Reflector
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
			context.getHandler(),
			context.getClass(),
		]);
		const contextType = context.getType();
		let request:Request|undefined = undefined;
		let client:Socket|undefined = undefined;
		let token:string|undefined;
		
		if (isPublic) {
			return (true);
		}

		if (contextType === 'http') {
			request = context.switchToHttp().getRequest();
			token = this.extractTokenFromHeader(request);
		} else {
			client = context.switchToWs().getClient<Socket>();
			token = this.extractTokenFromSocket(client);
		}

		if (!token) {
			this.logger.error('No token provided');
			if (contextType === 'http') {
				throw new UnauthorizedException("Invalid credentials");
			}
			throw new WsException({
				status: 401,
				message: "Invalid credentials",
				error: "Unauthorized"
			});
		} 
		try {
			const payload = await this.jwtService.verifyAsync(
				token,
				{
					secret: jwtConstants.secret,
				}
			);
			if (contextType === 'http') {
				request['user'] = payload;
			} else {
				client.data.user = payload;
			}
		} catch (e) {
			this.logger.error('Unable to verify your authorizations through JWT');
			this.logger.error(e);
			if (contextType === 'http') {
				throw new UnauthorizedException("Invalid credentials");
			} else {
				throw new WsException({
					status: 401,
					message: "Invalid credentials",
					error: "Unauthorized"
				});
			}
		}
		return (true);
	}

	private extractTokenFromHeader(request: Request): string | undefined {
		const [type, token] = request.headers.authorization?.split(' ') ?? [];
		return (type === 'Bearer' ? token : undefined);
	}

	private extractTokenFromSocket(client:Socket): string | undefined {
		const token = client.handshake.auth.token?.toString();
		return (token);
	}

}