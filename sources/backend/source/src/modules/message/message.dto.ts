import { IsString, Length, IsNumber, IsDefined, IsOptional } from "class-validator";

export class CreateMessageDTO {
	@IsDefined()
	@IsString()
	@Length(1, 100)
		content: string;

	@IsDefined()
	@IsNumber()
	@Length(1, 32)
		channelId: number;
}

export class JoinChannelDTO {
	@IsNumber()
	@IsDefined()
		channelId: number;

	@IsOptional()
	@IsString()
	@Length(1, 32)
		password?: string;
}