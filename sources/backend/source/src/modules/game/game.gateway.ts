import { ForbiddenException, Logger, UseFilters, UseGuards } from '@nestjs/common';
import {
	type OnGatewayConnection,
	type OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
	MessageBody,
	WsException,
	ConnectedSocket,
} from '@nestjs/websockets';
import { AuthGuard } from '../auth/auth.guard';
import { WsExceptionInterceptor } from '../../common/filters/WsExceptionInterceptor';

import { Socket } from 'socket.io';
import { type UserDetails, User } from '../users/users.interface';
import { UsersService } from '../users/users.service';
import { JoinQueueDTO, UserInputDTO } from './game.dto';
import { GameService } from './service/game.service';
import { AuthUser } from '../../common/decorators/user.decorator';
import { FinalGameData, GameData, GameUpdate } from './game.interface';
import { OnEvent } from '@nestjs/event-emitter';
import type { JWTData } from '../auth/auth.interface';
import { JwtService } from '@nestjs/jwt';

/**
 * Gateway for the game
 * @event joinQueue Join queue to get a game
 * @event joinGame Directly join a game
 * @event userInput Handle user input
 * @event userLoaded Tell the server that the user has loaded the game
 * @event initGame Init the game, when both players are ready
 * @event gameReady The game is ready to start
 * @event endGame End the game
 * @event gameUpdate Update the game
 * 
 * @emits userStatus Update the user status
 * @emits initGame Init the game, when both players are ready
 * @event gameReady The game is ready to start
 * @emits endGame End the game
 * @emits gameUpdate Update the game
 * @emits exception Send an exception to the client
 */
@UseGuards(AuthGuard)
@WebSocketGateway({
	cors: {
		origin: process.env.SITE_URL,
	},
	path: '/game',
})
// @UseGuards(WsThrottlerGuard)
@UseFilters(WsExceptionInterceptor)
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer() server;

	//<socketId, userId>
	connectedUsers: Map<string, number> = new Map();

	constructor(
		private readonly logger: Logger,
		private readonly userService: UsersService,
		private readonly gameService: GameService,
		private readonly jwtService: JwtService
	){}

	/* --------------------- Handle Connect / Disconnect ---------------------*/

	async handleConnection(
		@ConnectedSocket() client: Socket
	) {
		const token = client.handshake.auth.token;
		this.logger.log(`Client connected: ${client.id}`);
		try {
			if (!token) throw new ForbiddenException('No token provided');
			const payload:JWTData = await this.jwtService.verifyAsync(token);
			this.connectedUsers.set(client.id, payload.ID);
			this.server.emit('userStatus', {
				userId: payload.ID,
				status: "online"
			});
		} catch (error) {
			client.emit('exception', {
				statusCode: 401,
				message: "Wrong token format, please check your request",
				error: "Unauthorized"
			});
		}
	}


	/**
	 * When a user disconnect, remove it from queue or end the game.
	 * Remove it from connectedUsers
	 */
	async handleDisconnect(
		@ConnectedSocket() client: Socket
	) {
		this.logger.log(`Client disconnected: ${client.id}`);
		if (!this.connectedUsers.has(client.id)) return;
		const userId = this.connectedUsers.get(client.id);
		this.connectedUsers.delete(client.id);
		this.gameService.disconnectUser(userId);
	}

	/**
	 * Because socket is not always closed, the client could
	 * send a disconnect event to the server
	 */
	@SubscribeMessage('disconnectEvent')
	async disconnect(
		@ConnectedSocket() client: Socket
	) {
		this.logger.log(`Client disconnected: ${client.id}`);
		if (!this.connectedUsers.has(client.id)) return;
		const userId = this.connectedUsers.get(client.id);
		this.connectedUsers.delete(client.id);
		this.gameService.disconnectUser(userId);
	}

	private getSocketFromUserId(userId:number):Socket {
		for (const [socketId, id] of this.connectedUsers) {
			if (id === userId) return (this.server.sockets.sockets.get(socketId));
		}
	}

	/**
	 * Join queue to get a game
	 * When a game is found, the server will send a message to the client
	 */
	@SubscribeMessage('joinQueue')
	async joinQueue(
		@ConnectedSocket() client: Socket,
		@AuthUser() user: User,
		@MessageBody() joinQueue: JoinQueueDTO
	) {
		this.logger.log(`User ${user.ID} joined queue`);
		const userDetails = await this.userService.getUserBy('ID', user.ID, true) as UserDetails;
		if (!userDetails.ID) throw new WsException({
			status: 400,
			message: 'User not found',
			error: 'User not found'
		});
		this.connectedUsers.set(client.id, userDetails.ID);
		try {
			this.gameService.pushToQueue(userDetails, joinQueue.type);
		} catch (error) {
			throw new WsException(error);
		}
	}

	@SubscribeMessage('joinChallengeGame')
	async joinChallengeGame(
		@ConnectedSocket() client: Socket,
		@AuthUser() user: User,
		@MessageBody() gameId: string
	) {
		this.logger.log(`User ${user.ID} joined game ${gameId}`);
		try {
			this.gameService.joinChallengeGame(user.ID, parseInt(gameId));
		} catch (error) {
			throw new WsException(error);
		}
	}

	/**
	 * Only way to start the game. Start when both players are ready
	 */
	@SubscribeMessage('userLoaded')
	userLoaded(
		@AuthUser() user: User
	) {
		try {
			this.gameService.handleUserLoaded(user.ID);
		} catch {}
	}

	@SubscribeMessage('userInput')
	userInput(
		@AuthUser() user: User,
		@MessageBody() userInput: UserInputDTO
	) {
		try {
			this.gameService.handleUserInput(user.ID, userInput);
		} catch (error) {
			throw new WsException(error);
		}
	}
	
	/**
	 * Send the game object to users, to start the game
	 * @event initGame
	 */
	@OnEvent('initGame')
	initGame(game:GameData) {
		game.players.forEach(player => {
			const socket = this.getSocketFromUserId(player);
			if (!socket) throw new WsException({
				status: 400,
				message: 'User not found',
				error: 'User not found'
			});
			socket.join(game.ID.toString());
		});
		console.log('gameId', game.ID);
		this.server.to(game.ID.toString()).emit('initGame', game);
	}

	/**
	 * Send the game object to users. End the game
	 * @event endGame
	 */
	@OnEvent('endGame')
	endGame(gameId:number, game:FinalGameData) {
		this.server.to(gameId.toString()).emit('endGame', game);
	}

	/**
	 * Send the game object to the front
	 * to update the game
	 * @note Less data is sent trough GameUpdate
	 * @event gameUpdate
	 */
	@OnEvent('gameUpdate')
	sendGameUpdateToPlayers(gameId:number, game:GameUpdate) {
		//console.log('sendGameUpdateToPlayers', gameId, game);
		this.server.to(gameId.toString()).emit('gameUpdate', game);
	}

	@OnEvent('gameReady')
	gameReady(gameId:number, startDate:number) {
		console.log('gameReady', gameId);
		this.server.to(gameId.toString()).emit('gameReady', startDate);
	}
}