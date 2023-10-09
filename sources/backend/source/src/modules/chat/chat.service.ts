import { Prisma } from '@prisma/client';
import { Injectable, BadRequestException, UnauthorizedException, Logger, NotImplementedException } from '@nestjs/common';
import { PrismaService } from "../../common/providers/prisma/prisma.service"
import { UsersService } from '../users/users.service';
import { UserChannelRole } from '@prisma/client';
import { compare } from 'bcryptjs';
import { genSaltedHash } from './../../common/providers/encrypt';

import type { UserChannel, UserRole } from '@prisma/client';
import type { CreateChannelDTO } from './chat.dto';
import type { Channel, ChannelForUser, DetailedChannel, channelsMembers, updateChannelParticipantsResponse } from "./chat.interface"
import type { Participant } from "../users/users.interface"
import type { Message } from '../message/message.interface';
import type { JWTData } from '../auth/auth.interface';

interface participantInsert {
	userId: number;
	isConfirmed?: boolean;
	role: UserChannelRole;
}

const channelSelect = {
	ID: true,
	name: true,
	type: true,
	ownerId: true,
	createdAt: true,
	image: true
}

@Injectable()
export class ChatService {

	logger: Logger = new Logger(ChatService.name);

	constructor(
		private readonly prisma: PrismaService,
		private readonly users: UsersService
	) {}

	/**
	 * Insert given participants in a channel, making sure they can
	 * - Cause protected channels needs password
	 * @returns {number} Number of inserted participants
	 */
	async protectedInsertChannelParticipants(channelId: number, participants: participantInsert[], password?:string): Promise<number> {
		const channel = await this.prisma.channel.findUnique({
			where: { ID: channelId },
			select: { type: true, password: true }
		});
		if (!channel) throw new BadRequestException(`Channel ${channelId} does not exist`, "ChannelNotFound");
		if (channel.type === 'protected') {
			const userChannel = participants.length === 1 ? (
				await this.getChannelParticipant(channelId, participants[0].userId)
			) : null ;
			if (userChannel) return (0);
			if (!password) {
				throw new BadRequestException("Password is required to join this channel", "PasswordRequired");
			}
			if (channel.password) {
				const match = await compare(password, channel.password);
				if (!match) throw new BadRequestException("Invalid channel password", "WrongPassword");
			}
		}
		return (this.insertChannelParticipants(channelId, participants));
	}


	async insertChannelParticipants(channelId: number, participants: participantInsert[]): Promise<number> {
		const insertData = participants.map((p) => ({
			userId: p.userId,
			channelId,
			isConfirmed: p.isConfirmed || false,
			role: UserChannelRole?.[p?.role] || UserChannelRole.user
		}));
		try {
			this.logger.debug(`Inserting [${participants.map((p) => p.userId).join(',')}] in channel ${channelId}`);
			const response = await this.prisma.userChannel.createMany({
				data: insertData,
				skipDuplicates: true
			});
			return (response.count);
		} catch (e) {
			if (e instanceof Prisma.PrismaClientKnownRequestError) {
				if (e.code === 'P2002') {
					throw new BadRequestException(`One or more participants are already in the channel ${channelId}`, "AlreadyExistsError");
				}
			}
		}
	}

	async getChannelBans(userId:number):Promise<number[]> {
		return ((await this.prisma.userChannel.findMany({
			where: {
				userId,
				isBan: true
			},
			select: {
				channelId: true
			}
		})).map((c) => c.channelId));
	}

	async getChannelParticipant(channelId: number, userId: number): Promise<UserChannel> {
		return (await this.prisma.userChannel.findFirst({
			where: {
				channelId,
				userId
			}
		}));
	}

	async confirmUserChannel(participantChannelIdentifier:number): Promise<void> {
		await this.prisma.userChannel.update({
			where: {
				ID: participantChannelIdentifier
			},
			data: {isConfirmed: true}
		});
	}
	
	/**
	 * Get user participants in a channel
	 * Also return user who send a message in the channel in past 50 messages
	 * if they are not already in the channel trough the `emitterIds` parameter
	 * @param channelId
	 * @param confirmedUser If true, only return confirmed users
	 * @param emitterIds List of user who send a message in the channel in past 50 messages
	 */
	async getChannelParticipants(channelId: number, confirmedUser = true, emitterIds?:number[]):Promise<Participant[]> {
		const isConfirmedClause = (confirmedUser) ? { isConfirmed: true } : {};
		const participants = await this.prisma.userChannel.findMany({
			where: {
				channelId,
				...isConfirmedClause
			},
			select: {
				userId: true,
				isConfirmed: true,
				role: true,
				muteEnd: true,
				isBan: true,
			}
		});
		const participantsIds = participants.map((p) => p.userId);
		const emitterNotInParticipants = (emitterIds) ? emitterIds.filter((id) => !participantsIds.includes(id)) : [];
		this.logger.debug(`Emitter not in participants: ${emitterNotInParticipants.join(',')}`);
		const userIds = [
			...emitterNotInParticipants,
			...participantsIds
		]
		const detailedParticipants = await this.users.getUsersByIds(userIds, true, {
			ID: true,
			login: true,
			role: true,
		}) as Participant[];
		return (detailedParticipants.map((p) => {
			const participant = participants.find((u) => u.userId === p.ID);
			return ({
				...p,
				isConfirmed: participant?.isConfirmed || false,
				channelRole: participant?.role || UserChannelRole.user,
				muteEnd: participant?.muteEnd || null,
				isBan: participant?.isBan || false,
				isInChannel: participant ? true : false
			})
		}));
	}

	async getChannelActiveParticipants(channelId: number):Promise<number> {
		const activeParticipants:number = await this.prisma.userChannel.count({
			where: { 
				channelId,
				isConfirmed: true
			}
		});
		return (activeParticipants);
	}

	async getChannelMessages(channelId: number, take?:number):Promise<Message[]> {
		const messages = await this.prisma.message.findMany({
			where: {
				channelId
			},
			orderBy: {
				createdAt: "desc"
			},
			take: take || 50
		});
		messages.reverse();
		return (messages);
	}


	/**
	 * Initialize a channel with its participants and messages
	 * If memberAsParticipant is true, members will be returned as participants
	 * If confirmedUser is false, return last 50 people who sent a message in the channel
	 */
	async initChannel(
		channel: Channel,
		confirmedUser = true,
	):Promise<DetailedChannel> {
		if (!channel.ID) throw new BadRequestException("No channel provided", "NoChannelError");
		const messages = await this.getChannelMessages(channel.ID);
		const emitterIds = messages.map((m) => m.emitterId).filter((id, index, self) => self.indexOf(id) === index);
		const participants = await this.getChannelParticipants(channel.ID, confirmedUser, emitterIds);
		delete channel.password;
		return ({
			...channel,
			participants,
			messages,
			activeParticipants: participants.filter((p) => p.isConfirmed).length
		});
	}

	/**
	 * Validate logic for creating a channel
	 */
	private validateCreateChannelDTO(channelDTO: Partial<CreateChannelDTO>, callerUser:JWTData): void {
		if (!callerUser) {
			throw new UnauthorizedException("You must be logged in to edit a channel", "UnauthorizedError");
		}
		if (channelDTO?.type && channelDTO.type === "general" && callerUser?.role !== "admin") {
			throw new UnauthorizedException("You cannot create a general channel", "UnauthorizedError");
		}
		if (channelDTO?.type && channelDTO.type === "protected" && !channelDTO?.password && channelDTO?.password?.length === 0) {
			throw new BadRequestException("You must provide a password for a protected channel", "PasswordRequiredError");
		}
		if (channelDTO?.type && channelDTO.type !== "protected" && channelDTO?.password) {
			throw new BadRequestException("You cannot provide a password for a non-protected channel", "PasswordNotAllowedError");
		}
	}

	async createChannel(channelDTO: CreateChannelDTO, callerUser:JWTData)
		: Promise<DetailedChannel> {
		const { name, type, password } = channelDTO;
		let hashPass;

		this.validateCreateChannelDTO(channelDTO, callerUser);
		if (password) {
			hashPass = await genSaltedHash(password);
		}
		try {
			if (channelDTO?.password && channelDTO.password.length === 0)  throw NotImplementedException;
			const newChannel = await this.prisma.channel.create({
				data: {
					name,
					type,
					image: channelDTO.image,
					ownerId: callerUser.ID,
					password: hashPass || undefined,
				},
			}) as Channel;
			await this.insertChannelParticipants(newChannel.ID, [
				{userId:callerUser.ID, isConfirmed:true, role:UserChannelRole.admin},
				...channelDTO.participants.map((p) => ({
					userId:p,
					role:UserChannelRole.user
				}))
			]);
			return (await this.initChannel(newChannel));
		} catch (e) {
			if (e instanceof Prisma.PrismaClientKnownRequestError) {
				if (e.code === 'P2002') {
					throw new BadRequestException("Channel already exists", "AlreadyExistsError");
				}
			}
			throw e;
		}
	}

	async createPrivateChannel(
		emitterId: number,
		recipientId: number
	) : Promise<DetailedChannel> {
		const privateChannelName =  `Private Canal ${emitterId} ${recipientId}`;
		const newPrivateChannel = await this.prisma.channel.create({
			data: {
				name: privateChannelName,
				type: "conversation",
				ownerId: Number(emitterId)
			},
		}) as Channel;
		await this.insertChannelParticipants(newPrivateChannel.ID, [
			{userId:emitterId, isConfirmed:true, role:UserChannelRole.user},
			{userId:recipientId, isConfirmed:true, role:UserChannelRole.user}
		]);
		return (await this.initChannel(newPrivateChannel));
	}

	/**
	 * Compare participantsIds with the ones in the database
	 * Remove the ones that are not in participantsIds
	 * Add the ones that are in participantsIds but not in the database
	 */
	private async updateChannelParticipants(
		channelId: number,
		participantsIds: number[],
		ownerId:number
	):Promise<updateChannelParticipantsResponse> {
		const currentMembers = await this.getChannelMembersIds(channelId);
		const toRemove = currentMembers.filter((m) => !participantsIds.includes(m)).filter((m) => m !== ownerId);
		const toAdd = participantsIds.filter((m) => !currentMembers.includes(m));
		if (toRemove.length > 0) {
			this.logger.debug(`Removing ${toRemove.length} participants from channel ${channelId}`);
			await this.prisma.userChannel.deleteMany({
				where: {
					channelId,
					userId: {
						in: toRemove
					}
				}
			});
		}
		if (toAdd.length > 0) {
			this.logger.debug(`Adding ${toAdd.length} participants to channel ${channelId}`);
			await this.insertChannelParticipants(channelId, toAdd.map((p) => ({userId:p, role:UserChannelRole.user})));
		}
		return ({
			deleted: toRemove.length,
			added: toAdd.length
		});
	}

	/**
	 * Update a channel, only the owner can update it (except for admin)
	 */
	async updateChannel(id: number, channelDTO: Partial<CreateChannelDTO>, callerUser:JWTData): Promise<DetailedChannel> {
		const whereOwnerId = (callerUser?.role === "admin") ? 
			{} : { ownerId: callerUser?.ID };
		const updateObject:Partial<Prisma.ChannelUpdateArgs> = { data: {} }

		this.validateCreateChannelDTO(channelDTO, callerUser);
		const participants = channelDTO.participants || [];
		delete channelDTO.participants;
		for (const key in channelDTO) {
			if (key != "password")
				updateObject.data[key] = channelDTO[key];
			else if (channelDTO[key] && channelDTO[key].length > 0)
				updateObject.data[key] = await genSaltedHash(channelDTO[key]);
		}
		try {
			console.log(`user ${callerUser.ID} is updating channel ${id}`)
			const updatedChannel = await this.prisma.channel.update({
				where: { 
					ID: id ,
					...whereOwnerId
				},
				data: updateObject.data,
			}) as Channel;
			await this.updateChannelParticipants(updatedChannel.ID, participants, callerUser.ID);
			return (await this.initChannel(updatedChannel));
		} catch (e) {
			if (e instanceof Prisma.PrismaClientKnownRequestError) {
				if (e.code === 'P2025') {
					if (callerUser.role === "admin") {
						throw new BadRequestException("No Channel found", "NotFoundError");
					} else {
						throw new UnauthorizedException("You cannot update this channel", "UnauthorizedError");
					}
				}
			}
			throw e;
		}
	}

	/**
	 * Retrieve the only channel with type `general`
	 */
	async getGeneralChannel(): Promise<DetailedChannel> {
		const channel = await this.prisma.channel.findFirst({
			where: { type: "general" },
			orderBy: { ID: "asc" },
		}) as Channel;

		if (!channel) {
			throw new BadRequestException("No Channel found", "NotFoundError");
		}
		return (await this.initChannel(channel));
	}

	/**
	 * Retrieve a channel by its id
	 * @param id If not provided, return the general channel
	 */
	async getChannelById(
		id?: number,
		confirmedUser = true
	): Promise<DetailedChannel> {
		if (!id || id === 0) {
			return (this.getGeneralChannel());
		}
		try {
			const channel = await this.prisma.channel.findUniqueOrThrow({
				where: { ID: id	},
				select: channelSelect
			}) as Channel;
			return (await this.initChannel(channel, confirmedUser));
		} catch (e) {
			if (e instanceof Prisma.PrismaClientKnownRequestError) {
				if (e.code === 'P2025') {
					throw new BadRequestException("No Channel found", "NotFoundError");
				}
			}
			throw e;
		}
	}
	
	private async getChannelsTotalMembersByIds(channelIds: number[]): Promise<channelsMembers> {
		const channelTotalMembers = await this.prisma.userChannel.groupBy({
			by: ['channelId'],
			where: {
				channelId: {
					in: channelIds
				},
				isConfirmed: true
			},
			_count: {
				userId: true
			}
		});
		return (channelTotalMembers);
	}

	private async getChannelMembersIds(channelId: number, confirmedUser = true): Promise<number[]> {
		const isConfirmedClause = (confirmedUser) ? { isConfirmed: true } : {};
		const channelMembers = await this.prisma.userChannel.findMany({
			where: {
				channelId,
				...isConfirmedClause
			},
			select: {
				userId: true
			}
		});
		return (channelMembers.map((c) => c.userId));
	}

	async getChannels(): Promise<ChannelForUser[]> {
		const channels = await this.prisma.channel.findMany({
			where: {
				type: { in: ["public", "protected"] }
			},
			select: channelSelect
		}) as Channel[];
		const channelsMembers = await this.getChannelsTotalMembersByIds(channels.map(c => c.ID));
		return (channels.map((channel) => ({
			...channel,
			isMember: false,
			friendMemberCount: 0,
			memberCount: channelsMembers.find((c) => c.channelId === channel.ID)?._count?.userId || 0
		})));
	}

	/**
	 * Return all public and protected channels, for the given user
	 * @returns {ChannelForUser[]} List of channels, for room page
	 */
	async getChannelsByUser(userId: number): Promise<ChannelForUser[]> {
		const channels = await this.prisma.$queryRaw<ChannelForUser[]>(Prisma.sql`
			SELECT "Channel"."ID","Channel"."name","Channel"."type","Channel"."owner_id" as "ownerId","Channel"."created_at" as "createdAt","Channel"."image"
				FROM "Channel"
				LEFT JOIN "UserChannel"
					ON "UserChannel"."channel_id" = "Channel"."ID"
				WHERE "UserChannel"."user_id" = ${userId}
				AND "Channel"."type" NOT IN ('general', 'conversation')
		`);
		const channelTotalMembers = await this.getChannelsTotalMembersByIds(channels.map(c => c.ID));
		return (channels.map((channel) => ({
			...channel,
			isMember: true,
			friendMemberCount: 0,
			memberCount: channelTotalMembers.find((c) => c.channelId === channel.ID)?._count?.userId || 0
		})));
	}

	async deleteChannel(id: number, user:JWTData): Promise<boolean> {
		if (!id) throw new BadRequestException("No channel provided", "NoChannelError");
		if (!user || !user.ID) {
			throw new UnauthorizedException("You must be logged in to delete a channel", "UnauthorizedError");
		}
		try {
			this.logger.debug(`User ${user.ID} is deleting channel ${id}`);
			await this.completeDeleteChannel(id, user.ID);
			return (true);
		} catch (e) {
			if (e instanceof Prisma.PrismaClientKnownRequestError) {
				if (e.code === 'P2025') {
					if (user?.role === "admin") {
						throw new BadRequestException("No Channel found", "NotFoundError");
					} else {
						throw new UnauthorizedException("You cannot delete this channel", "UnauthorizedError");
					}
				}
			}
			throw e;
		}
	}

	/**
	 * Delete a channel, and all its messages, and all its members
	 * @throw {BadRequestException} If the user is not the owner
	 */
	private async completeDeleteChannel(channelId: number, ownerId:number): Promise<void> {
		await this.prisma.channel.delete({
			where: { ID: channelId, ownerId }
		});
		await this.prisma.userChannel.deleteMany({
			where: { channelId }
		});
		await this.prisma.message.deleteMany({
			where: { channelId }
		});
	}

	async joinChannel(userId:number, channelId: number, isConfirmed = true): Promise<DetailedChannel> {
		this.logger.debug(`User ${userId} asked to join channel ${channelId}`);
		const channel = this.getChannelById(channelId);
		try {
			await this.prisma.userChannel.create({
				data: {
					userId,
					channelId,
					isConfirmed
				}
			});
			return (channel);
		} catch (e) {
			if (e instanceof Prisma.PrismaClientKnownRequestError) {
				if (e.code === 'P2002') {
					throw new BadRequestException("You are already a member of this channel", "AlreadyMemberError");
				}
			}
		}	
	}

	private async assertUserLeaveChannel(userId:number, channelId: number): Promise<void> {
		const userChannel = await this.prisma.userChannel.findFirst({
			where: {channelId, userId}
		});
		if (!userChannel) throw new BadRequestException("You are not a member of this channel", "NotMemberError");
		if (userChannel.isBan === true) throw new BadRequestException("You cannot interact with this channel while banned", "BannedError");
	}

	/**
	 * Leave a channel, or delete it if the user is the owner
	 */
	async leaveChannel(userId:number, channelId: number): Promise<boolean> {
		this.logger.debug(`User ${userId} asked to leave channel ${channelId}`);
		const channel = await this.getChannelById(channelId);
		if (!channel) throw new BadRequestException("No Channel found", "NotFoundError");
		if (channel.ownerId === userId) {
			this.completeDeleteChannel(channelId, userId);
			return (true);
		}
		await this.assertUserLeaveChannel(userId, channelId);
		const {count:deletedRows} = await this.prisma.userChannel.deleteMany({
			where: {
				channelId,
				userId
			}
		});
		return (deletedRows > 0);
	}

	/**
	 * Return private channel of the given user
	 * @returns {DetailedChannel[]} List of private channels (for tchat)
	 */
	async getListPrivateChannel(userId: number): Promise<DetailedChannel[]> {
		const channels = await this.prisma.$queryRaw<Channel[]>(Prisma.sql`
			SELECT "Channel"."ID", "Channel"."name",  "Channel"."type", "Channel"."created_at" as createdAt 
				FROM "Channel"
					JOIN "UserChannel" ON "Channel"."ID" = "UserChannel"."channel_id"
				WHERE 
					"Channel"."type" = 'conversation'
				AND
					"UserChannel"."user_id" = ${userId}
		`);
		const privateChannels = await Promise.all(channels.map(async (channel) => {
			return ({
				...channel,
				participants: await this.getChannelParticipants(channel.ID),
				activeParticipants: 2,
				messages: await this.getChannelMessages(channel.ID, 10)
			})
		}));
		return (privateChannels.sort((a, b) => {
			const aLastMessage = a.messages[a.messages.length - 1];
			const bLastMessage = b.messages[b.messages.length - 1];
			if (!aLastMessage) return (1);
			if (!bLastMessage) return (-1);
			const aDate = new Date(aLastMessage.createdAt).getTime();
			const bDate = new Date(bLastMessage.createdAt).getTime();
			return (bDate - aDate);
		}));
	}

	//queryRaw select only `conversation` channels?
	async initOrGetPrivateChannel(emitterId: number, recipientId: number): Promise<DetailedChannel> {
		const channelID = await this.prisma.$queryRaw<number>(Prisma.sql`
			SELECT "UserChannel"."channel_id"
				FROM "UserChannel"
				WHERE "UserChannel"."channel_id" IN (
					SELECT "UserChannel"."channel_id"
					FROM "UserChannel"
					WHERE user_id IN (CAST(${emitterId} AS INTEGER), CAST(${recipientId} AS INTEGER))
					GROUP BY "UserChannel"."channel_id"
					HAVING COUNT(DISTINCT user_id) = 2
				)
			GROUP BY "UserChannel"."channel_id"
			HAVING COUNT(*) = 2;
		`);
		if (channelID[0] === null || channelID[0] === undefined) {
			return (this.createPrivateChannel(emitterId, recipientId));
		}
		return (await this.getChannelById(channelID[0].channel_id));
	}


	/**
	 * Currently, site admin can't do action on Channel owner
	 */
	async handleChannelAdminAction(
		channelID:number,
		requester:JWTData,
		targetUserId:number,
		action: string
	): Promise<UserChannel> {
		const channel = await this.prisma.channel.findFirstOrThrow({
			where: { ID: channelID },
		}) as Channel;
		const userChannels = await this.prisma.userChannel.findMany( {
			where: { channelId: channelID },
		}) as UserChannel[];
		if (!userChannels) throw new BadRequestException("No userChannels found", "NotFoundError");
		const adminUserChannel = userChannels.find(user => user.userId === requester.ID);
		if (adminUserChannel?.role !== "admin"
			&& channel.ownerId !== requester.ID && requester.role !== "admin") {
			throw new UnauthorizedException('Not administrator of the channel');
		}
		const targetUserChannel = userChannels.find(user => user.userId === targetUserId);
		if (!targetUserChannel || channel.ownerId === targetUserChannel.userId) {
			if (!targetUserChannel) this.logger.error(`Not found user ${targetUserId} in channel ${channelID}`);
			else this.logger.error(`User ${targetUserId} is owner of channel ${channelID}`);
			throw new UnauthorizedException(`Impossible to ${action} this user`);
		}
		return (targetUserChannel);
	}


	async changeUserRole(
		channelID: number,
		user: JWTData,
		targetUserId: number,
		role: UserRole
	) : Promise<boolean> {
		const targetUserChannel = await this
			.handleChannelAdminAction(channelID, user, targetUserId, "change role of");
		const updatedUserChannel = await this.prisma.userChannel.update( { 
			where: { ID: targetUserChannel.ID, userId: targetUserId },
			data: {
				role: UserChannelRole[role]
			}
		})
		return (updatedUserChannel.role === UserChannelRole[role]);
	}

	/**
	 * If user is already muted, unmute him
	 * @returns {boolean} true if user is muted, false otherwise
	 */
	async muteUser(channelID: number, user: JWTData, targetUserId: number) : Promise<boolean> {
		const targetUserChannel = await this
			.handleChannelAdminAction(channelID, user, targetUserId, "mute");
		const actualDate = new Date();
		let muteEnd;
		if (actualDate <= targetUserChannel.muteEnd)
			muteEnd = null;
		else {
			const muteDurationInHour = 48;
			const muteDuration = muteDurationInHour * 60 * 60 * 1000;
			muteEnd = new Date(actualDate.getTime() + muteDuration);
			//mute end is now
		}
		this.logger.log(`Mute user ${targetUserId} in channel ${channelID} until ${muteEnd}`);
		const updatedUserChannel = await this.prisma.userChannel.update( { 
			where: {  ID: targetUserChannel.ID, userId: targetUserId },
			data: {
				muteEnd
			}
		})
		return (muteEnd !== null && updatedUserChannel.muteEnd > actualDate);
	}

	/**
	 * Ban & Unban user
	 */
	async banUser(channelID: number, user: JWTData, targetUserId: number) : Promise<boolean> {
		const targetUserChannel = await this
			.handleChannelAdminAction(channelID, user, targetUserId, "ban");
		const updatedUserChannel = await this.prisma.userChannel.update( { 
			where: {  ID: targetUserChannel.ID, userId: targetUserId },
			data: {
				isBan : !targetUserChannel.isBan
			}
		});
		return (updatedUserChannel.isBan);
	}
}