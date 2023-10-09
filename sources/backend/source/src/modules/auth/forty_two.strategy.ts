import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';

import type { UserDetails, userCoalition42 } from './auth.interface';

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, '42') {
	constructor() {
		super({
			authorizationURL: 'https://api.intra.42.fr/v2/oauth/authorize',
			tokenURL: 'https://api.intra.42.fr/v2/oauth/token',
			clientID: process.env.FORTY_TWO_CLIENT_ID, // Remplacez par votre client ID
			clientSecret: process.env.FORTY_TWO_SECRET, // Remplacez par votre client secret
			callbackURL: process.env.FORTY_TWO_REDIRECT_URL, // Remplacez par votre URL de callback
		});
	}

	private async getUserCoalition(userId42:number, accessToken:string):Promise<string> {
		const response = await fetch(`https://api.intra.42.fr/v2/users/${userId42}/coalitions`, {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});
		const data:userCoalition42[]|undefined = await response.json();
		const parisCoalitionId = [45, 46, 47, 48];
		const userCoalition = data?.find(coalition => parisCoalitionId.includes(coalition.id));
		return (userCoalition?.name || "none");
	}

	async getUserDetails(accessToken: string): Promise<UserDetails> {
		const apiUrl = 'https://api.intra.42.fr/v2/me';
	
		try {
			const response = await fetch(apiUrl, {
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});

			if (!response.ok) {
				throw new Error('Réponse de l\'API non valide');
			}
			const data = await response.json();
			const userCoalition = await this.getUserCoalition(data.id, accessToken);
			return {
				email: data.email,
				firstName: data?.first_name || "",
				lastName: data?.last_name || "",
				login: data.login,
				expiryDate : data.expiryDate,
				providerId: data.id,
				accessToken,
				userCoalition,
			};
		} catch (error) {
			console.error('Erreur lors de l\'appel à l\'API 42:', error.message);
			throw error;
		}
	}

	async validate(accessToken: string): Promise<UserDetails> {

		const userData = await this.getUserDetails(accessToken);

		const email = userData.email;
		const firstName = userData?.firstName || "";
		const lastName = userData?.lastName || "";
		const login = userData.login;
		const expiryDate = userData.expiryDate;
	
		const user = {
			email,
			firstName,
			lastName,
			login,
			accessToken,
			expiryDate,
			userCoalition: userData.userCoalition,
			providerId: userData.providerId,
		};
		return (user)
	}
}