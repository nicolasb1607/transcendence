/* eslint-disable @typescript-eslint/no-unused-vars */

//Data always present in the token

interface BasicUserData {
	ID: number;
	login: string;
	role?: UserRole;
}

interface JWTData extends BasicUserData {
	iat: number;
	exp: number;
}

interface User extends BasicUserData {
	status: boolean;
}

interface UserLevel {
	level?: number;
	exp?: number;
}

type userCoalition42 = "The Federation" | "The Order" | "The Assembly" | "The Alliance"

interface UserDetails extends User {
	avatar?:string;
	experience?: UserLevel;
	email?: string;
	coalition?: string;
	firstName?:string;
	lastName?:string;
	description?:string;
}

type UserWithAvatar = Omit<UserDetails, "email"|"status"|"role"|"level">;

type BadgeType = "filled" | "percentage"
type UserRole = "admin" | "moderator"


// Achievements

interface UnlockConditions {
	statKey: string;
	statValue: number;
	OR?: UnlockConditions[];
}
interface Achievement {
	id: number;
	name: string;
	group?: string;
	description: string;
	image: string;
	//Upgrade achievement
	parent?: number;
	//Define how to display the achievement
	postfix?: string;
	//Define how to unlock the achievement
	unlock?: UnlockConditions;
}

interface UserAchievement extends Achievement {
	owned: boolean;
}

/**
 * Define how avatar is stored
 */
interface UserAvatar {
	coalition: string;
	path:	string;
}


type userMetaKeys = "avatar" | "level" | "experience" | "description";

type UserMeta = {
		[key in userMetaKeys]?:string;
}


interface UserMetaAssertion {
	data: UserMeta | undefined
	isLoading: boolean
}

interface UpdateDTO {
	ID: number;
	login: string;
	email: string;
	firstName?: string;
	lastName?: string;
	avatar?: string;
	description?: string;
	/**
	 * Hashed password
	 */
	password?: string;
}

interface UserRelation {
	userId: number;
	relationId: number;
	status: friendshipStatus;
}
/**
 * Player status
 */
type UserStatus = 'offline' | 'online' | 'away' | 'inGame';

/**
 * Index is the user ID.
 */
type PlayerStatus = Array<UserStatus>;

interface PlayerStatusUpdate {
	userId: number;
	status: UserStatus;
}

type Challenge = [
	userChallenge,
	UserDetails
]

interface OnlinePlayersCtx {
	onlinePlayers: PlayerStatus;
	setOnlinePlayers: React.Dispatch<React.SetStateAction<PlayerStatus>>;

	challenge: Challenge | null;
	setChallenge: React.Dispatch<React.SetStateAction<Challenge | null>>;
	challengeUser: ((challengedID: number, gameType:GameType) => void) | null;
}

interface userChallenge {
	challenger: number;
	challenged: number;
	gameType: GameType;
	createdAt?: Date;
}

/**
 * End of player status
 */