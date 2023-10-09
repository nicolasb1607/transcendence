import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { UserChannelRole } from '@prisma/client';
import { PrismaService } from '../../common/providers/prisma/prisma.service';
import { ChatService } from '../chat/chat.service';
import { WsException } from '@nestjs/websockets';
import type { CreateMessageDTO } from './message.dto';
import type { Message, tchatUserData, userSocket } from './message.interface';
import type { JWTData } from '../auth/auth.interface';
import type { Socket } from 'socket.io';
import type { JoinChannelDTO } from './message.dto';
import type { DetailedChannel } from '../chat/chat.interface';


@Injectable()
export class MessageService {

	/**
	 * Map of connected users
	 * Key: Socket ID
	 * Value: User ID
	 */
	private connectedUsers: Map<string, tchatUserData> = new Map();

	constructor(
		private readonly prisma: PrismaService,
		private readonly logger: Logger,
		private readonly chatService: ChatService
	) { }

	/* ----------------------  Manage connected Users  ---------------------- */

	setConnectedUser(socketId:string, tchatUserData?:tchatUserData){
		this.connectedUsers.set(socketId, tchatUserData || {});
	}

	disconnectUser(socketId:string){
		this.connectedUsers.delete(socketId);
	}

	/**
	 * Return the user Data associated with the socket ID
	 */
	getConnectedUser(socketId:string){
		return this.connectedUsers.get(socketId);
	}

	getConnectedUserByUserId(userId:number):userSocket | undefined {
		const userSockets = {
			socketId: [],
			tchatUserData: undefined
		}
		for (const [socketId, tchatUserData] of this.connectedUsers.entries()) {
			if (tchatUserData.userID === userId){
				userSockets.socketId.push(socketId);
				userSockets.tchatUserData = tchatUserData;
			}
		}
		return (userSockets.socketId.length > 0 ? userSockets : undefined);
	}

	/* --------------------------- Database call  --------------------------- */

	public async createMessage(emitterId: number, messageDTO: CreateMessageDTO): Promise<Message> {
		const { content, channelId } = messageDTO;

		if (!channelId) {
			throw new BadRequestException("No recipient provided", "NoRecipientError");
		}
		const newMessage = await this.prisma.message.create({
			data: {
				content,
				emitterId,
				channelId
			}
		});
		return (newMessage);
	}

	/* ----------------------  Assertion (private)  ---------------------- */

	private async assertMessageSubmission(
		messageDTO: CreateMessageDTO,
		emitter: JWTData
	): Promise<void> {
		if (messageDTO.channelId < 0) throw new BadRequestException("Invalid channel ID");
		this.logger.log(`Message received from user ${emitter.ID} in channel ${messageDTO.channelId}`);
		const userChannel = await this.chatService.getChannelParticipant(
			messageDTO.channelId, emitter.ID);
		const date = new Date();
		if (!userChannel || userChannel.isBan || (userChannel.muteEnd && userChannel.muteEnd > date)) {
			throw new WsException({
				status: 403,
				message: "You are not allowed to send messages in this channel",
				error: "Forbidden"
			});
		}
	}

	private async assertChannelJoin(
		client: Socket,
		joinChannelDTO: JoinChannelDTO
	): Promise<void> {
		if (joinChannelDTO.channelId < 0) throw new BadRequestException("Invalid channel ID");
		console.log(`User has requested to join channel ${joinChannelDTO.channelId}`)
		const userData = this.getConnectedUser(client.id);
		if (!userData) throw new WsException({
			status: 403,
			message: "You are not allowed to join this channel",
			error: "Forbidden"
		});
	}

	/* ----------------------  Private methods  ---------------------- */

	/**
	 * When user join a channel, this function run if he was already a member
	 * If he's banned, throw an error
	 * If he's not confirmed, confirm his membership
	 */
	private async handleJoinWithConfirmAndBanUser(
		channelId: number,
		userId: number
	): Promise<number> {
		console.log(`User ${userId} was already a member of channel ${channelId}`)
		const userChannel = await this.chatService.getChannelParticipant(channelId, userId);
		if (!userChannel || userChannel.isBan) throw new WsException({
			status: 403,
			message: "You are not allowed to join this channel",
			response: {
				error: "ForbiddenChannel"
			}
		});
		if (userChannel && !userChannel.isConfirmed){
			this.logger.log(`User ${userId} has confirmed his membership to channel ${channelId}`)
			await this.chatService.confirmUserChannel(userChannel.ID);
			return (1);
		}
		return (0);
	}


	/* ----------------------  Public methods  ---------------------- */

	/**
	 * Send a message to a channel. The message is saved in the database
	 * On success, the message is sent back to the channel.
	 * User must be connected to the channel to send a message
	 * @emits message (send the new message to the channel)
	 * @emits exception
	 */
	public async sendMessage(
		messageDTO: CreateMessageDTO,
		emitter: JWTData
	): Promise<Message> {
		try {
			await this.assertMessageSubmission(messageDTO, emitter);
		} catch (e){
			throw new WsException(e);
		}
		try {
			this.logger.log(`Message sent to channel ${messageDTO.channelId}`);
			return (await this.createMessage(emitter.ID, messageDTO));
		} catch (e) {
			throw new WsException({
				status: 500,
				message: "An error occured while sending the message",
				error: "Internal Server Error"
			});
		}
	}

	/**
	 * Connect a user to a channel
	 * - If the user is already a member, do nothing
	 * - Handle Ban & non-confirmed user
	 * @emits exception (if the user is not allowed to join the channel)
	 */
	public async joinChannel(
		client: Socket,
		joinChannelDTO: JoinChannelDTO,
		user: JWTData
	): Promise<DetailedChannel> {
		this.assertChannelJoin(client, joinChannelDTO);
		const { channelId, password } = joinChannelDTO;
		let insertedUsers = 0;
		try {
			insertedUsers = await this.chatService
				.protectedInsertChannelParticipants(channelId, [
					{ userId: user.ID, role: UserChannelRole.user, isConfirmed: true }
				], password);
		} catch (e) {
			throw new WsException(e);
		}
		if (insertedUsers === 0) {
			insertedUsers += await this.handleJoinWithConfirmAndBanUser(channelId, user.ID);
		}
		const channel = await this.chatService.getChannelById(channelId);
		client.join(channelId.toString());
		this.setConnectedUser(client.id, { userID: user.ID, roomID: channelId, login: user.login });
		client.emit('channel', channel);
		return (channel);
	}

	public async disconnectFromChannel(
		client: Socket,
		channelId: number
	): Promise<void> {
		const userData = this.getConnectedUser(client.id);
		try {
			this.setConnectedUser(client.id, { ...userData, roomID: undefined });
			client.leave(channelId.toString());
		} catch (e) {
			throw new WsException(e);
		}
	}

	public async kickUserFromChannel(
		channelId: number,
		userId: number
	): Promise<userSocket|null> {
		const success = await this.chatService.leaveChannel(userId, channelId);
		if (success){
			const connectedUser = this.getConnectedUserByUserId(userId);
			this.connectedUsers.set(userId.toString(), {roomID: undefined});
			return (connectedUser);
		}
		return (null);
	}
}