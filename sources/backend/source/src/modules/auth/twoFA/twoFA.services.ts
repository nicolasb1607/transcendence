import { Injectable, Logger } from '@nestjs/common';
import type { TwoFAData, TwoFAResponse } from './twoFA.interface';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';
import { UsersService } from '../../users/users.service';


@Injectable()
export class TwoFAService {

	constructor(
		private readonly usersService: UsersService,
		private readonly logger: Logger,
	) {
		this.logger = new Logger(TwoFAService.name)
	}

	async turnOnTwoFA(username: string): Promise<TwoFAResponse|undefined> {

		const user = await this.usersService.retrieveUserByLogin(username);

		const response = await this.generateTwoFASecret(user.login);
		if (response?.success === false)
			return (response)
		const dataUrl = await toDataURL(response.message);
		return ({
			success: true,
			message: dataUrl
		});
	}

	async generateTwoFASecret(username: string): Promise<TwoFAResponse|undefined> {

		const user = await this.usersService.retrieveUserByLogin(username);

		const secret = (user.TwoFASecret === "") ? authenticator.generateSecret() : user.TwoFASecret;
		const otpAuthUrl = authenticator.keyuri(user.email, 'Transcendance', secret);

		const updateData: TwoFAData = {
			TwoFASecret: secret,
			isTwoFAEnabled: false
		}
		if (!await this.usersService.update2FA(user.ID, updateData)) {
			return ({
				success: false,
				message: "error in 2FA activation",
			})
		}
		return ({
			success: true,
			message: otpAuthUrl,
		});
	}

	async updateTwoFAStatus(login: string, status: boolean): Promise<TwoFAResponse> {

		const user = await this.usersService.retrieveUserByLogin(login);
		const updateData: TwoFAData = {
			TwoFASecret: user.TwoFASecret,
			isTwoFAEnabled: status
		}
		if (!await this.usersService.update2FA(user.ID, updateData))
			return ({
				success: false,
				message: "error: failed to turn on 2fa",
			})
		return ({
			success: true,
			message: "2fa successfully turned on",
		});
	}
}