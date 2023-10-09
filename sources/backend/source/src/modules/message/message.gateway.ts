import { BadRequestException, UseFilters, UseGuards } from '@nestjs/common';
import {
	type OnGatewayConnection,
	type OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
	MessageBody,
	ConnectedSocket,
	WsException,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { CreateMessageDTO, JoinChannelDTO } from './message.dto';
import { MessageService } from './message.service';
import { ChatService } from '../chat/chat.service';
import { WsExceptionInterceptor } from '../../common/filters/WsExceptionInterceptor';
import { AuthGuard } from '../auth/auth.guard';
import { AuthUser } from '../../common/decorators/user.decorator';
import { WsThrottlerGuard } from '../../common/guards/WsThrottlerGuard';
import { JWTData } from '../auth/auth.interface';
import { UsersService } from '../users/users.service';
import type { userSocket } from './message.interface';
import { OnEvent } from '@nestjs/event-emitter';

/**
 * Message Gateway (Websocket)
 * @event message (send)
 * @event join (join a channel)
 * @event leave (leave a channel)
 * @emits kick (kick a user from a channel)
 * @emits refreshChannel (send refresh update to channel listeners)
 */
@UseGuards(AuthGuard)
@WebSocketGateway({
	path: "/message",
	cors: {
		origin: process.env.SITE_URL,
	}
})
@UseGuards(WsThrottlerGuard)
@UseFilters(WsExceptionInterceptor)
export class MessageGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer() server;

	constructor(
		private readonly usersService: UsersService,
		private readonly messageService: MessageService,
		private readonly chatService: ChatService
	) { }

	/**
	 * handleConnection is run before decorators
	 */
	async handleConnection(client: Socket) {
		this.messageService.setConnectedUser(client.id);
	}

	async handleDisconnect(client: Socket) {
		this.messageService.disconnectUser(client.id);
	}

	private throw = (status: number, message: string, error: string) => {
		throw new WsException({ status, message, error });
	}

	/**
	 * Send a message to a channel. The message is saved in the database
	 * @return The Message object
	 * @emits message (send the new message to the channel)
	 * @emits exception
	 */
	@SubscribeMessage('message')
	async onMessage(
		@MessageBody() messageDTO: CreateMessageDTO,
		@AuthUser() user: JWTData
	) {
		const newMessage = await this.messageService.sendMessage(messageDTO, user);
		this.server.to(messageDTO.channelId.toString())
			.emit('message', newMessage);
	}

	/**
	 * Connect a user to a channel
	 * @returns The channel object
	 * @emits channel (send the channel object to the user)
	 * @emits refreshChannel (send refresh update to channel listeners)
	 * @emits exception
	 */
	@SubscribeMessage('join')
	async onCanalJoin(
		@ConnectedSocket() client: Socket,
		@MessageBody() joinChannelDTO: JoinChannelDTO,
		@AuthUser() user: JWTData
	) {
		const channel = await this.messageService.joinChannel(client, joinChannelDTO, user);
		if (channel) {
			this.server.to(channel.ID.toString()).emit('refreshChannel', channel);
		}
	}

	/**
	 * Disconnect a user from a channel
	 * @emits exception
	 */
	@SubscribeMessage('leave')
	async onCanalLeave(
		@ConnectedSocket() client: Socket,
		@MessageBody() joinChannelDTO: JoinChannelDTO
	) {
		if (joinChannelDTO.channelId < 0) throw new BadRequestException("Invalid channel ID");
		await this.messageService.disconnectFromChannel(client, joinChannelDTO.channelId);
	}

	/**
	 * Disconnect a user from a channel
	 * @emits kick (send the kick action to the user)
	 */
	private handleKickAction(
		channelId: number,
		userId: number,
		targetUser: userSocket
	):Socket[] | undefined {
		if (channelId < 0) throw new BadRequestException("Invalid channel ID");
		if (userId <= 0) throw new BadRequestException("Invalid user ID");
		const sockets: Socket[] = [];
		for (const socketId of targetUser.socketId) {
			const client = this.server.sockets.sockets.get(socketId) as Socket;
			if (client) {
				client.leave(channelId.toString());
				this.messageService.setConnectedUser(client.id, { ...this.messageService.getConnectedUser(client.id), roomID: undefined });
				sockets.push(client);
			}
		}
		return (sockets.length > 0 ? sockets : undefined);
	}

	/**
	 * Kick a user from a channel
	 * @emits kick (send the kick action to the user)
	 */
	public async kickUserFromChannel(
		channelId: number,
		userId: number,
		targetUser: userSocket
	) : Promise<void> {
		const clients = this.handleKickAction(channelId, userId, targetUser);
		const newMessage = await this.messageService.createMessage(0, {
			channelId,
			content: `${targetUser.tchatUserData?.login} has been kicked from the channel`,
		});
		this.server.to(channelId.toString()).emit('message', newMessage);
		clients?.forEach(client => {
			client.emit('kick', {channelId, userId})
		});
	}

	/**
	 * Display a ban message in the channel and kick the user
	 */
	public async banUserFromChannel(
		channelId: number,
		userId: number,
		targetUser: userSocket|undefined,
		isBan: boolean
	) : Promise<void> {
		const user = await this.usersService.getUserBy("ID", userId);
		const banText = isBan ? "banned" : "unbanned";
		const newMessage = await this.messageService.createMessage(0, {
			channelId,
			content: `${user.login} has been ${banText} from the channel`,
		});
		this.server.to(channelId.toString()).emit('message', newMessage);
		if (targetUser && isBan){
			const clients = this.handleKickAction(channelId, userId, targetUser);
			clients?.forEach(client => {
				client.emit('kick', {channelId, userId, ban: true})
			});
		}
	}

	@OnEvent('refresh.channel')
	async refreshChannel(channelId: number) {
		if (channelId < 0) this.throw(400, "Invalid channel ID", "Bad Request");
		const channel = await this.chatService.getChannelById(channelId);
		this.server.to(channelId.toString()).emit('refreshChannel', channel);
	}
}
