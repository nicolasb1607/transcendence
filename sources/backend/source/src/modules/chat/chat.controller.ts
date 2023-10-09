import { Controller, Get, Post, Put, Body, Param, Delete, HttpCode, UnauthorizedException, ParseIntPipe, InternalServerErrorException, Query, BadRequestException } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChannelDTO } from './chat.dto';
import type { Participant } from '../users/users.interface';
import { AuthUser } from '../../common/decorators/user.decorator';
import { UserChannelRole } from '@prisma/client';
import type { ChannelForUser, DetailedChannel } from './chat.interface';
import { JWTData } from '../auth/auth.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';

/**
 * All routes in this controller
 * are protected by the AuthGuard
 */
@Controller('chat/channel')
export class ChatController {
	constructor(
		private readonly chatService: ChatService,
		private readonly eventEmitter: EventEmitter2
	) { }

	@Post()
	@HttpCode(201)
	async createChannel(@AuthUser() user:JWTData, @Body() channelData: CreateChannelDTO): Promise<DetailedChannel> {
		return (await this.chatService.createChannel(channelData, user));
	}

	/**
	 * Retrieve all channels
	 */
	@Get()
	async getChannels(): Promise<ChannelForUser[]> {
		return (await this.chatService.getChannels());
	}

	@Get('user/:userId')
	async getChannelsByUser(
		@AuthUser() user:JWTData,
		@Param('userId', ParseIntPipe) userId: number
	): Promise<ChannelForUser[]> {
		if (userId <= 0) throw new BadRequestException("Invalid user ID");
		if (user.ID !== userId && user?.role !== 'admin') {
			throw new UnauthorizedException("You are not allowed to access this resource.");
		}
		return (await this.chatService.getChannelsByUser(userId));
	}

	@Get('channelBans')
	async getChannelBans(
		@AuthUser() user:JWTData,
	): Promise<number[]> {
		return (await this.chatService.getChannelBans(user.ID));
	}

	@Get(':channelId')
	async getChannelById(
		@Param('channelId', ParseIntPipe) id: number,
		@Query('confirmedUser') confirmedUser?: string
	): Promise<DetailedChannel> {
		if (id < 0) throw new BadRequestException("Invalid channel ID");
		return (await this.chatService.getChannelById(
			id,
			confirmedUser === 'false' ? false : true
		));
	}

	@Get('privateChannels/:userId')
	async getPrivateChannels(
		@AuthUser() user:JWTData,
		@Param('userId', ParseIntPipe) id: number
	): Promise<DetailedChannel[]> {
		if (id <= 0) throw new BadRequestException("Invalid user ID");
		if (user.ID !== id && user?.role !== 'admin') {
			throw new UnauthorizedException("You are not allowed to access this resource.");
		}
		return (await this.chatService.getListPrivateChannel(id));
	}

	/**
	 * Only the channel owner is allowed to update the channel
	 * or the admin
	 */
	@Put(':channelId')
	async updateChannel(
		@AuthUser() user:JWTData,
		@Body() channelData: CreateChannelDTO,
		@Param('channelId', ParseIntPipe) id: number
	): Promise<DetailedChannel> {
		if (id < 0) throw new BadRequestException("Invalid channel ID");
		return (await this.chatService.updateChannel(id, channelData, user));
	}
	
	@Delete(':channelId')
	async deleteChannel(
		@AuthUser() user:JWTData,
		@Param('channelId', ParseIntPipe) channelId: number
	): Promise<{message:string}> {
		if (channelId < 0) throw new BadRequestException("Invalid channel ID");
		await this.chatService.deleteChannel(channelId, user);
		return ({ message: "Channel deleted successfully." });
	}

	@Get(':channelId/leave')
	async leaveChannel(
		@AuthUser() user:JWTData,
		@Param('channelId', ParseIntPipe) channelId: number
	): Promise<{message:string}> {
		if (channelId < 0) throw new BadRequestException("Invalid channel ID");
		if (await this.chatService.leaveChannel(user.ID, channelId)) {
			return ({ message: "Channel left successfully." });
		}
		throw new InternalServerErrorException("An error happened");
	}

	/**
	 * Join a channel trough HTTP
	 */
	@Get(':channelId/join')
	async joinChannel(
		@AuthUser() user:JWTData,
		@Param('channelId', ParseIntPipe) id: number,
		@Query('password') password?: string
	): Promise<{message:string}> {
		if (id < 0) throw new BadRequestException("Invalid channel ID");
		await this.chatService.protectedInsertChannelParticipants(id, [
			{userId:user.ID, isConfirmed: true, role: UserChannelRole.user}
		], password);
		this.eventEmitter.emit('refresh.channel', id);
		return ({ message: "Channel joined successfully." });
	}

	/**
	 * Return all participants of a channel, wether they are confirmed or not
	 */
	@Get(':channelId/participants')
	async getChannelParticipants(
		@Param('channelId', ParseIntPipe) id: number
	): Promise<Participant[]> {
		if (id < 0) throw new BadRequestException("Invalid channel ID");
		return (await this.chatService.getChannelParticipants(id, false));
	}

	@Get('private/:emitterId')
	async initOrGetPrivateChannel(
		@AuthUser() user:JWTData,
		@Param('emitterId', ParseIntPipe) emitterId: number,
		@Query('recipientId', ParseIntPipe) recipientId: number
	) : Promise<DetailedChannel> {
		if (emitterId <= 0 || recipientId <= 0) throw new BadRequestException("Invalid user ID");
		if (user.ID !== emitterId) throw new UnauthorizedException("You are not allowed to access this resource.");
		if (emitterId === recipientId) throw new BadRequestException("You cannot create a private channel with yourself.");
		return (await this.chatService.initOrGetPrivateChannel(emitterId, recipientId));
	}
}
