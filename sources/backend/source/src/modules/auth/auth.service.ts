import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { PrismaService } from "../../common/providers/prisma/prisma.service"

import type { Response } from 'express';
import type { OauthUserDTO } from './auth.dto';
import type { UserOauth } from '@prisma/client';
import type { ApiToken, JWTData, Providers } from './auth.interface';
import type { CreateUserDTO } from '../users/users.dto';
import type { User, User2FA, UserDetails } from '../users/users.interface';
import { authenticator } from 'otplib';
import type { SignInDto } from './auth.dto';

@Injectable()
export class AuthService {
	private logger = new Logger(AuthService.name);
	private transactions: Map<string, User2FA> = new Map();

	constructor(
		private usersService: UsersService,
		private jwtService: JwtService,
		private readonly prisma: PrismaService,
	) { }

	async signIn(signInDto: SignInDto): Promise<ApiToken> {
		const { login, password, twoFACode } = signInDto;
		try {
			const user = await this.usersService.retrieveUserByLogin(login);

			if (user.isTwoFAEnabled){
				if (!twoFACode || !authenticator.verify({token: twoFACode, secret: user.TwoFASecret})) {
					throw new BadRequestException('Invalid 2FA code');
				}
			}
			const passwordMatches = await compare(password, user?.password);
			if (!passwordMatches) {
				throw new UnauthorizedException('Invalid credentials');
			} else {
				return this.setToken(user);
			}
		}
		catch (e) {
			if (e instanceof BadRequestException && e.message === 'Invalid 2FA code') {
				throw e;
			}
			this.logger.error(e);
			throw new UnauthorizedException('Invalid credentials');
		}

	}

	async register(newUser: CreateUserDTO): Promise<ApiToken|undefined> {
		const user = await this.usersService.createUser(newUser);
		return (await this.setToken(user));
	}

	async getExistingUser(newUser: OauthUserDTO) : Promise<User2FA> {
		return await this.usersService.getUserByEmail(newUser.email);
	}

	async check2FAOauthIsEnable( User: User2FA ) : Promise<boolean> {
		if (User.isTwoFAEnabled) {
			return (true);
		}
		return (false);
	}

	async oauthLogin(newUser: OauthUserDTO, provider: Providers): Promise<ApiToken> {
		try {
			const existingUser = await this.usersService.getUserByEmail(newUser.email);
			return this.loginExistingUser(existingUser, newUser, provider);
		} catch (e) {
			return this.createUserAndSetToken(newUser, provider);
		}
	}

	private async createUserAndSetToken(newUser: OauthUserDTO, provider: Providers): Promise<ApiToken> {
		const user = await this.usersService.createOauthUser(newUser, provider);
		return this.setToken(user);
	}

	private async loginExistingUser(user: User2FA, newUser: OauthUserDTO, provider: Providers): Promise<ApiToken> {
		const oauthEntry = await this.usersService.retrieveOauthByUserId(user.ID, provider);
		if (!oauthEntry) {
			throw new UnauthorizedException('User already registered');
		}
		if (user.isTwoFAEnabled) {
			const transactionCode = this.generateTransactionCode(user);
			throw new UnauthorizedException({message: 'A 2FA code is required', transactionCode});
		  }
		await this.updateAccessToken(newUser, oauthEntry);
		return this.setToken(user);
	}

	async signInTwoFA(user: User2FA): Promise<ApiToken> {
		return await this.setToken(user);
	}

	private async updateAccessToken(newUser: OauthUserDTO, oauthEntry: UserOauth): Promise<void> {
		await this.prisma.userOauth.update({
			where: {
				ID: oauthEntry.ID,
			},
			data: {
				accessToken: newUser.accessToken,
			},
		});
	}

	setCookie(res: Response, token: string) {
		const expDate = new Date();
		expDate.setHours(expDate.getHours() + 1);
	
		res.cookie('jwt_token', token, {
			path: '/',
			expires: expDate,
			sameSite: true,
		});
	}

	generateHTMLResponse(message: string, redirectUrl: string): string {
		return `
			<html>
				<body>
					<script>
						window.opener.postMessage("${message}", "${redirectUrl}");
						window.close();
					</script>
				</body>
			</html>
		`;
	}

	async verifyTwoFA(transactionCode: string, userCode: string): Promise<boolean> {
		const user = this.getUserFromTransactionCode(transactionCode);
		if (!user) {
			throw new BadRequestException('Invalid credentials');
		}
		return await authenticator.verify({ token: userCode, secret: user.TwoFASecret });
	}

	generateTransactionCode(user: User2FA): string {
		const code = Math.random().toString(36).substring(2, 15); // génère un code aléatoire
		this.transactions.set(code, user);
		setTimeout(() => this.transactions.delete(code), 300000); // supprime le code après 5 minutes
		return code;
	}
  
	getUserFromTransactionCode(code: string): User2FA | undefined {
		return this.transactions.get(code);
	} 

	public async setToken(user: User|UserDetails): Promise<ApiToken|undefined> {
		const payload:JWTData = { login: user.login, ID: user.ID, role: user.role };
		const apiToken: ApiToken = { accessToken: ''};
		apiToken.accessToken = await this.jwtService.signAsync(payload);

		return apiToken;
	}
}
