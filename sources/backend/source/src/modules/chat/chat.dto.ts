import { IsEnum, IsNumber, IsOptional, IsString, Length, Matches } from "class-validator";

import { channelType } from "./chat.interface";


export class CreateChannelDTO {

	@IsEnum(['general', 'private', 'protected', 'public', 'conversation'])
	@IsString()
		type: channelType;

	@IsString()
	@Length(3, 18)
	@Matches(/^[a-zA-Z-_\s\d]+$/)
		name: string;
	
	@IsOptional()
	@IsString()
	@Length(2, 32)
		password?: string;
	
	@IsString()
	@Matches(/^[a-zA-Z0-9_-]+\.(jpg)$/)
		image: string;
	
	@IsOptional()
	@IsNumber({}, {each: true})
		participants: number[];
}