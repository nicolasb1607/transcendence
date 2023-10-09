type UserRole = "admin" | "moderator"

interface UserLevel {
	level?: number;
	exp?: number;
}

export interface user {
	ID: number;
	login: string;
	role?: UserRole;
	avatar?:string;
	experience?: UserLevel;
	email?: string;
	coalition?: string;
}

export interface JWTData {
	login: string;
	ID: number;
	role: UserRole;
}
