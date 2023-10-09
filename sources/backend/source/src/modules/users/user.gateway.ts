import { Logger, UseFilters, UseGuards } from '@nestjs/common';
import {
	type OnGatewayConnection,
	type OnGatewayDisconnect,
	WebSocketGateway,
	WebSocketServer,
	ConnectedSocket,
	SubscribeMessage,
	MessageBody,
} from '@nestjs/websockets';
import { AuthGuard } from '../auth/auth.guard';
import { WsExceptionInterceptor } from '../../common/filters/WsExceptionInterceptor';
import { WsThrottlerGuard } from '../../common/guards/WsThrottlerGuard';
import { UsersService } from './users.service';
import { PlayerStatusUpdate, UserAchievementUpdate,type UserDetails,
	type UserSession, userChallenge } from './users.interface';
import { Socket } from 'socket.io';
import { OnEvent } from '@nestjs/event-emitter';
import { JWTData } from '../auth/auth.interface';
import { StatsService } from '../stats/stats.service';
import { ChallengeDTO } from './users.dto';
import { AuthUser } from '../../common/decorators/user.decorator';
import { UserChallengeService } from './userChallenge.service';
import { RelationsService } from '../relations/relations.service';

/**
 * Gateway for the user module
 * Handle user connection, disconnection, challenge
 * @emits userStatus
 * @emits challenge
 * @emits challenge.accept
 * @emits challenge.decline
 * @emits userSessionUpdate Signal to the client that the user session has been updated
 * @emits updateRelation
 */
@UseGuards(AuthGuard)
@WebSocketGateway({
	path: "/users",
	cors: {
		origin: process.env.SITE_URL,
	}
})
@UseGuards(WsThrottlerGuard)
@UseFilters(WsExceptionInterceptor)
export class UserGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer() server;

	constructor(
		private readonly logger: Logger,
		private readonly userService: UsersService,
		private readonly statsService: StatsService,
		private readonly userChallengeService: UserChallengeService,
		private readonly relation: RelationsService
	) {}

	/**
	 * `handleConnection` is called before Filter and Guard
	 */
	async handleConnection(client: Socket) {
		const payload = await this.userService.onConnection(client);
		if (payload && "ID" in payload) this.server.emit('userStatus', {
			userId: payload.ID,
			status: "online"
		});
	}

	async handleDisconnect(@ConnectedSocket() client: Socket) {
		this.userService.onDisconnect(client);
	}

	@OnEvent('user.status.update')
	async handleUserStatusUpdate(data: PlayerStatusUpdate) {
		this.server.emit('updateStatus', data);
	}

	/**
	 * Trigger when user unlock an achievement, 
	 * send the achievement ID to the client
	 */
	@OnEvent('user.achievement.update')
	async handleUserAchievementUpdate(data: UserAchievementUpdate) {
		const socketId = this.userService.getSocketIdFromUserId(data.userId);
		if (socketId) {
			this.server.sockets.sockets.get(socketId).emit(
				'userAchievement',
				data.achievementIds,
				await this.statsService.getUserStats(data.userId)
			);
		}
	}

	private getUserSockets(userId: number): Socket[] {
		const sockets: Socket[] = [];
		const socketArray = this.userService.getSocketIdToUserIdMap();
		for (const [socketId, id] of socketArray.entries()) {
			if (id === userId) sockets.push(this.server.sockets.sockets.get(socketId));
		}
		return (sockets);
	}

	/**
	 * @emits challenge The challenge is sent to both users with the challenger data
	 * @emits exception If the challenge is invalid
	 */
	@SubscribeMessage('user.challenge')
	async challengeUserSocket(
		@ConnectedSocket() client: Socket,
		@AuthUser() user: JWTData,
		@MessageBody() data: ChallengeDTO
	) {
		const challengedSocket = this.getUserSockets(data.userId);
		await this.userChallengeService.challengeUser(
			user.ID, data, client, challengedSocket[0]
		);
	}

	/**
	 * @deprecated Seem to be unused
	 */
	@OnEvent('user.challenge')
	async challengeUser(data: userChallenge) {
		const challengerSocket = this.getUserSockets(data.challenger)?.[0];
		const challengedSocket = this.getUserSockets(data.challenged)?.[0];
		if (!challengedSocket || !challengerSocket) return ;
		const challenger = await this.userService.getUserBy("ID", data.challenger, true);
		this.logger.log(`sending challenge to ${challengedSocket.id} & ${challengerSocket.id}`);
		challengedSocket.emit('challenge', data, challenger);
		challengerSocket.emit('challenge', data, challenger);
	}

	/**
	 * Trigger when a user accept a challenge
	 * @emits challenge.accept Run the game and send the game ID to both users
	 */
	@OnEvent('user.challenge.accept')
	async acceptChallenge(data: userChallenge) {
		const challengerSocket = this.getUserSockets(data.challenger)?.[0];
		const challengedSocket = this.getUserSockets(data.challenged)?.[0];
		console.log({challengerSocket, challengedSocket})
		this.userChallengeService.initChallengeGame(
			challengerSocket, challengedSocket, data
		);
	}

	/**
	 * Trigger when a user cancel a challenge
	 * @emits challenge.cancel Send the cancel event to the challenged user
	 */
	@OnEvent('user.challenge.cancel')
	async cancelChallenge(data: userChallenge) {
		const challengerSocket = this.getUserSockets(data.challenger);
		const challengedSocket = this.getUserSockets(data.challenged);
		await this.userChallengeService.cancelChallengeEvent(
			challengerSocket, challengedSocket, data
		);
	}

	/**
	 * Trigger when a user decline a challenge
	 * @emits challenge.decline Send the decline event to the challenger user
	*/
	@OnEvent('user.challenge.decline')
	async declineChallenge(data: userChallenge) {
		const challengerSockets = this.getUserSockets(data.challenger);
		await this.userChallengeService.declineChallenge(challengerSockets, data);
	}

	/**
	 * Trigger when a user session need to be updated
	 * @emits userSessionUpdate Send the signal to the client
	 */
	@OnEvent('user.session.update')
	async handleUserSessionUpdate(userId: number, notification?: string) {
		this.logger.log(`User ${userId} session updated`);
		const socketId = this.userService.getSocketIdFromUserId(userId);
		if (socketId) {
			const userDetails = await this.userService.getUserBy("ID", userId, true) as UserDetails;
			const userRelations = await this.relation.getUserRelation(userId, userId);
			this.server.sockets.sockets.get(socketId).emit('userSessionUpdate', {
				...userDetails,
				relations: userRelations
			} as UserSession, notification);
		}
	}
}