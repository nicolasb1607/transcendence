
export type friendshipStatus = "friend" | "requested" | "requesting" | "blocked" | "none";

export interface UserRelationDb {
	ID: number;
	userId: number;
	relationId: number;
	status: friendshipStatus;
}

export interface UserRelation {
	ID: number;
	userId: number;
	login: string;
	avatar: string;
	level: number;
	friendship: string;
}

export interface SessionRelation {
	friend: number[];
	requested: number[];
	requesting: number[];
	blocked: number[];
}