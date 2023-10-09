import {
	IsString,
	IsNumber,
	IsEnum,
	IsPositive,
	IsDefined
} from 'class-validator'

type UserRelationStatus = 'friend' | 'blocked' | 'requesting';

export class CreateRelationDto {
	@IsNumber()
	@IsPositive()
	@IsDefined()
		relationId: number;
	
	@IsString()
	@IsEnum(['friend', 'blocked', 'requesting'])
		status: UserRelationStatus;
}

export class DeleteRelationDto {
	@IsNumber()
	@IsPositive()
	@IsDefined()
		relationId: number;
}
