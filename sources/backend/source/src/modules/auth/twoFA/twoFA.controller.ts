import { Controller, ParseBoolPipe, Post, Query } from '@nestjs/common';
import { TwoFAService } from './twoFA.services';
import type { TwoFAResponse } from './twoFA.interface';
import { JWTData } from '../auth.interface';
import { AuthUser } from '../../../common/decorators/user.decorator';

@Controller('api/auth/2fa')
export class twoFAController {
	constructor(private readonly twoFAService : TwoFAService) {}

	@Post()
	turnOnTwoFA(
		@AuthUser() user: JWTData,
	):Promise<TwoFAResponse> {
		return (this.twoFAService.turnOnTwoFA(user?.login));
	}

	@Post('state')
	updateTwoFAStatus(
		@AuthUser() user: JWTData,
		@Query('activate', ParseBoolPipe) activate: boolean,
	):Promise<TwoFAResponse> {
		return (this.twoFAService.updateTwoFAStatus(user?.login, activate));
	}
}