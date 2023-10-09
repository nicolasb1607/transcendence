export interface Message {
	readonly ID: number;
	emitterId: number;
	content: string;
	readonly createdAt: Date;
}

export interface tchatUserData {
	roomID?: number;
	userID?: number;
	login?: string;
}


export interface userSocket {
	readonly socketId: string[];
	readonly tchatUserData: tchatUserData;
}