import { IsDate, IsNotEmpty, IsOptional, IsEmail, IsString, Length, IsDefined } from "class-validator";

export class SignInDto {
	@IsNotEmpty()
		login: string;

	@IsNotEmpty()
		password: string;

	@IsOptional()
	@Length(6)
		twoFACode?: string;
}

export class OauthUserDTO {
	@IsNotEmpty()
	@IsEmail()
	@IsString()
		email: string;

	@IsNotEmpty()
	@IsString()
		accessToken: string; // Replace 'access_token' with actual token
	
	@IsNotEmpty()
		providerId: number|string;

	@IsOptional()
	@IsString()
		refreshToken: string; // Replace 'refresh_token' with actual refresh token

	@IsOptional()
	@IsDate()
		expiryDate: Date;

	@IsOptional()
	@IsString()
		firstName: string;

	@IsOptional()
	@IsString()
		lastName: string;

	@IsOptional()
	@IsString()
		login: string;

	@IsOptional()
	@IsString()
		userCoalition: string;
}

export class Validate2FADto {
	@IsDefined()
	@IsString()
	@Length(1, 255)
		transactionCode: string;

	@IsDefined()
	@IsString()
	@Length(6, 6)
		userCode: string;
}
  