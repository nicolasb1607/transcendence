import { Body, Controller, Get, HttpCode, HttpStatus, Post, Request, Req, Res, UseGuards, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './auth.dto';
import { Public } from '../auth/constants';
import { Throttle } from '@nestjs/throttler';
import { CreateUserDTO } from '../users/users.dto';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { Validate2FADto} from './auth.dto';

import type { OauthUserDTO } from './auth.dto';
import type { ApiToken, Providers } from './auth.interface';

@Controller('api/auth')
export class AuthController {
	logger = new Logger("AuthController");

	constructor(
		private readonly authService : AuthService
	) {}

	@Public()
	@Throttle(15, 900)
	@Post('login')
	async signIn(@Body() signInDto: SignInDto):Promise<ApiToken> {
		return (await this.authService.signIn(signInDto));
	}

	@Public()
	@Throttle(5, 900)
	@Post('register')
	async register(@Body() createUserDto: CreateUserDTO) {
		return (await this.authService.register(createUserDto));
	}

	@Public()
	@Get('login/google')
	@UseGuards(AuthGuard('google'))
	async googleAuth(@Req() req) {
		this.logger.log(req);
	}

	@Public()
	@Get('redirect/google')
	@UseGuards(AuthGuard('google'))
	async googleAuthRedirect(@Req() req, @Res() res: Response) {
		return this.handleOauthRedirect(req, res, 'google');
	}

	@Public()
	@Get('login/42')
	@UseGuards(AuthGuard('42'))
	async authWith42(@Req() req) {
		this.logger.log(req);
	}

	@Public()
	@Get('redirect/42')
	@UseGuards(AuthGuard('42'))
	async authWith42redirect(@Req() req, @Res() res: Response) {
		return this.handleOauthRedirect(req, res, 'forty_two');
	}

	//Might be deleted in futur. The purpose of this function is to check if jwt token is working
	@Get('profile')
	getProfile(@Request() req) {
		return (req.user);
	}

	@Public()
	@Post('validate2fa')
	async validate2fa(@Body() validate2FADto: Validate2FADto):Promise<ApiToken | undefined> {
		const { transactionCode, userCode } = validate2FADto;
		if (! await this.authService.verifyTwoFA(transactionCode, userCode)) {
			throw new BadRequestException('Invalid 2FA code');
		}
		const user = this.authService.getUserFromTransactionCode(transactionCode);
		if (!user) {
			throw new NotFoundException('User not found for transaction code')
		}
		return this.authService.signInTwoFA(user);
	}

	private async handleOauthRedirect(req, res: Response, provider: Providers) {
		try {
			const user = req.user as OauthUserDTO;

			const authResponse = await this.authService.oauthLogin(user, provider);
	
			this.authService.setCookie(res, authResponse.accessToken);
			res.send(this.authService.generateHTMLResponse('auth-complete', process.env.SITE_URL));
		} catch (e) {
			if (e.response?.message === 'A 2FA code is required') {
				this.logger.log("A 2FA code is required");
				res.send(this.authService.generateHTMLResponse(`2FA required,${e.response.transactionCode}`, process.env.SITE_URL));
			} else {
				this.logger.log("error occured");
				res.send(this.authService.generateHTMLResponse(e.message, process.env.SITE_URL));
			}
		}
	}
}
