/* eslint-disable @typescript-eslint/no-unused-vars */

interface Message {
	readonly ID: number;
	readonly createdAt: number;
	readonly emitterId: number;
	readonly content: string;
}

type displayedChatType = 'general' | 'private';
type ChatType = 'private' | 'general' | 'protected' | 'public' | 'conversation'
type UserChannelRole = 'admin' | 'user'

interface Participant extends UserDetails {
	channelRole: UserChannelRole;
	muteEnd: Date|null;
	isBan: boolean;
	isConfirmed: boolean;
	isInChannel: boolean;
}

interface Chat {
	readonly ID: number;
	readonly created_at?: number;
	name: string;
	/**
	 * List of participants in the channel
	 * A participant is a user actively in the channel
	 * or a user who sent a message in the channel in past 50 messages
	 */
	participants: Participant[];
	activeParticipants: number;
	messages: Message[];
	type?: ChatType;
	image: string;
	ownerId: number;
}

interface ChatDetails extends Omit<Chat, 'participants'|'messages'|'created_at'> {
	memberCount: number;
	friendMemberCount: number;
	isMember: boolean;
}

type CreateRoomFormInputs = "name" | "type" | "password" | "passwordConfirmation";
/**
 * Define available room types in form.
 * Protected room are public room with password.
 */
type RoomType = 'private' | 'public' | 'protected' | 'general';

interface CreateRoomForm {
	name: string;
	type: RoomType;
	password?: string;
	//No need to be send to backend
	passwordConfirmation?: string;
	image: string;
	participants: number[];
	/**
	 * List of participants in the channel
	 * When form is in edit mode
	 */
	previousParticipants?: RoomMember[];
	ownerId?: number;
}

type CreateRoomDTO = Omit<CreateRoomForm, 'passwordConfirmation'>;

interface BaseManageRoom {
	currentRoom: CreateRoomForm;
	updateCurrentRoom: React.Dispatch<React.SetStateAction<Partial<CreateRoomForm>>>;
}
interface ValidateCreateRoomFormResponse {
	valid: boolean;
	error?: string;
	failingStep?: 0 | 1 | 2;
}

type ChannelUpdateResponse = Chat|NestError|null;

interface RoomMember extends UserDetails {
	isConfirmed: boolean;
}

type userPrivateEventType = 'userId' | 'channelId'
interface userPrivateClickEvent {
	type: userPrivateEventType;
	value: number;
}

type PopOverActions = 'challenge' | 'message' | 'edit' | 'kick' | 'ban'
	| 'mute'
type PopOverSnackbarActions = 'kick' | 'ban' | 'mute'

type ChannelContext = {
	channelId: number;
	setChannelId: React.Dispatch<React.SetStateAction<number>>;
}