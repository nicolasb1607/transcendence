import type { User as TableUser, UserChannel, UserChannelRole, UserStatus, UserOauth as TableUserOauth, UserMeta as TableUserMeta } from "@prisma/client";
import type { SessionRelation } from "../relations/relations.interfaces";

/**
 * Basic user information.
 * @see schema.prisma
 */
export type User = Omit<TableUser, 'password'|'TwoFASecret'|'isTwoFAEnabled'>;

export type User2FA =  Omit<TableUser, 'password'>;

export type UserDb = TableUser

type userMetaKeys = "avatar" | "experience" | "coalition" | "description" | "firstName" | "lastName"

export type UserMeta = {
	[key in userMetaKeys]?:string;
}

export type UserMetaLine = TableUserMeta;

export interface UserLevel {
	level: number;
	exp: number;
}

export interface UserDetails extends User {
	avatar?:	string;
	experience:	UserLevel;
}

export type UserSession = UserDetails & {
	relations: SessionRelation;
}

export type UserId = Pick<User, 'ID'>;

/**
 * Detailed user, but with restricted information.
 */
export type Participant = Omit<UserDetails, 'email'|'is_active'> &
	Pick<UserChannel, 'role' | 'muteEnd' | 'isBan'|'isConfirmed'> & {
		role: UserChannelRole;
		isInChannel: boolean;
  }

export type UserDateStatus = [
	UserStatus,
	Date
]

/**
 * Index is the user ID.
 */
export type UsersDateStatus = Array<UserDateStatus>;
export type UsersStatus = Array<UserStatus>;

export interface PlayerStatusUpdate {
	userId: number;
	status: UserStatus;
}

export interface UserAchievementUpdate {
	userId: number;
	achievementIds: number[];
}

export type oauthUserDb = TableUserOauth;

export interface userChallenge {
	challenger: number;
	challenged: number;
	gameType: "spatial" | "classic";
}

export interface ChallengeRequest extends userChallenge {
	createdAt: Date;
}

export type Challenge = [
	ChallengeRequest,
	UserDetails
]

export interface ChallengeUserData {
	challenger: UserDetails;
	challenged: UserDetails;
}
