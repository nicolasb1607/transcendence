import type {Participant} from "../users/users.interface";
import type {Message} from '../message/message.interface';
import type { Prisma } from "@prisma/client";

/**
 * Defines the type of a channel
 * - `General`: A channel that everyone can join
 * - `Private`: A channel that only invited users can join
 * - `conversation` : Is a private channel dedicated to a conversation between two users
 */
export type channelType = 'general' | 'private' | 'protected' | 'public' | 'conversation';

export interface Channel {
	readonly ID: number;
	readonly createdAt: Date;
	name: string;
	type: channelType;
	ownerId?: number;
	password?: string;
	image: string;
}

export interface UserChannel {
	readonly ID: number;
	readonly createdAt: Date;
	userId: number;
	channelId: number;
	role: string;
	muteEnd: Date;
	isBan: boolean;
}

export interface DetailedChannel extends Channel {
	/**
	 * List of participants in the channel
	 * A participant is a user actively in the channel
	 * or a user who sent a message in the channel in past 50 messages
	 */
	participants: Participant[];
	activeParticipants: number;
	messages: Message[];
}

/**
 * Channel for Chat rooms
 * @link ChatDetails (frontend)
 */
export interface ChannelForUser extends Channel {
	memberCount: number;
	friendMemberCount: number;
	isMember: boolean;
}

export type channelsMembers = (Prisma.PickArray<Prisma.UserChannelGroupByOutputType, "channelId"[]> & {
	_count: {
		userId: number;
	};
})[];

export type updateChannelParticipantsResponse = {
	deleted: number;
	added: number;
}
