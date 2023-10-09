import type { UserRole } from "@prisma/client";

export interface ApiToken {
	accessToken: string;
}

export interface JWTData {
	login: string;
	ID: number;
	role: UserRole;
}

export type Providers = 'google' | 'forty_two';

export interface GoogleUser {
	email: string;
	firstName: string;
	lastName: string;
	accessToken: string;
	expiryDate: Date;
}

export interface UserDetails {
	email: string;
	firstName: string;
	lastName: string;
	login: string;
	accessToken: string;
	expiryDate: Date;
	userCoalition?:string;
	providerId: number|string;
}

export interface GoogleProfile {
	id: string;
	displayName: string;
	name: {
		familyName: string;
		givenName: string;
	};
	emails: [
		{
			value: string;
			verified: boolean;
		}
	];
	photos: [
		{
			value: string;
		}
	];
	provider: string;
	_raw: string;
	_json: {
		sub: string;
		name: string;
		given_name: string;
		family_name: string;
		picture: string;
		email: string;
		email_verified: boolean;
		locale: string;
	};
}


export interface userCoalition42 {
	id: number;
	cover_url: string;
	image_url: string;
	color: string;
	score: number;
	name: string;
	slug: string;
	userId: number;
}