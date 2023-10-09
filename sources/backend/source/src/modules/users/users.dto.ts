import { UserStatus } from '@prisma/client';
import { Transform, type TransformFnParams } from 'class-transformer';
import {
	IsOptional,
	IsEmail,
	IsString,
	Length,
	Matches,
	IsNumber,
	MaxLength,
	IsEnum,
	IsPositive,
	IsDefined,
} from 'class-validator'


export class CreateUserDTO {

	@IsString()
	@Length(3, 20)
	@Matches(/^\S*$/)
		login: string;

	@IsEmail()
	@Length(3,255)
		email: string;

	@IsString()
	@Length(12, 70)
	@Matches(/[a-z]/)
	@Matches(/[A-Z]/)
	@Matches(/\d/)
	@Matches(/[!@#$%^&*?_~]/)
		password: string;
}

export class UpdateUserDto {
	
	@IsOptional()
	@IsString()
	@Length(3, 20)
	@Matches(/^\S*$/)
		login?: string;

	@IsOptional()
	@IsEmail()
	@Length(3,255)
		email?: string;

	@IsOptional()
	@IsString()
	@Length(12, 70)
	@Matches(/[a-z]/)
	@Matches(/[A-Z]/)
	@Matches(/\d/)
	@Matches(/[!@#$%^&*?_~]/)
		password?: string;
}

export class UpdateUserMetaDTO {
	@IsOptional()
	@IsEmail()
	@Length(3,255)
		email?:  string;

	@IsOptional()
	@IsString()
	@Length(3, 20)
	@Matches(/^\S*$/)
		login?: string;

	@IsOptional()
	@IsString()
	@Length(2, 30)
		firstName?: string;

	@IsOptional()
	@IsString()
	@Length(2, 30)
		lastName?: string;
	
	@IsOptional()
	@MaxLength(255)
		avatar?: string;

	@IsOptional()
	@MaxLength(100)
		description?: string;
}

export class pageDTO {
	@IsOptional()
	@Transform((value: TransformFnParams) => parseInt(value.value))
		page?: number;
}

export class enhancedDTO {
	@IsOptional()
	@Transform((value: TransformFnParams) => value.value === 'true')
		enhanced?: boolean;
}

export class UserIdsDTO {
	@IsNumber({}, {each: true})
		ids: number[];
}

export class UserStatusDTO {
	@IsEnum(['offline', 'online', 'away', 'inGame'])
		status: UserStatus;
}

export class ChallengeDTO {
	@IsNumber()
	@IsPositive()
	@IsDefined()
		userId: number;
	@IsEnum(['spatial', 'classic'])
	@IsDefined()
		gameType: 'spatial' | 'classic';
}
