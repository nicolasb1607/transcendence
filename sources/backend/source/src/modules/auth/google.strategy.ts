import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import type { GoogleProfile, GoogleUser } from './auth.interface';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {

	constructor() {
		super({
			clientID: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_SECRET,
			callbackURL: `http://localhost:${process.env.API_PORT}/api/auth/redirect/google`,
			scope: ['email', 'profile'],
		});
	}

	async validate (accessToken: string, refreshToken: string, profile: GoogleProfile): Promise<GoogleUser> {
		const { name, emails } = profile
		const user = {
			email: emails[0].value,
			firstName: name?.givenName || '',
			lastName: name?.familyName || '',
			accessToken,
			expiryDate: undefined
		}
		return user;
	}
}
