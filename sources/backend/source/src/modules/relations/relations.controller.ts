import { Controller, Get, Post, Body, Param, ParseIntPipe, Put, Delete } from '@nestjs/common';
import { AuthUser } from '../../common/decorators/user.decorator';
import type { UserRelationDb, SessionRelation } from './relations.interfaces';
import { RelationsService } from './relations.service';
import { CreateRelationDto, DeleteRelationDto } from './relations.dto';
import { Public } from '../auth/constants';
import { JWTData } from '../auth/auth.interface';


@Controller('api/relations') 
export class RelationsController {
	constructor(
		private readonly relationsService: RelationsService,
	) {}

	@Get(':userid')
	async getUserRelations(
		@AuthUser() user: JWTData,
		@Param('userid', ParseIntPipe) id:number
	) : Promise<SessionRelation> {
		if (id <= 0) throw new Error("Invalid user id");
		return (await this.relationsService.getUserRelation(user.ID, id));
	}

	@Post()
	async createRelation(
		@AuthUser() user: JWTData,
		@Body() createRelationDto:CreateRelationDto
	): Promise<UserRelationDb> {
		return (await this.relationsService.createRelation(user.ID, createRelationDto));	
	}

	@Put()
	async updateRelation(
		@AuthUser() user: JWTData,
		@Body() updateRelationDto:CreateRelationDto
	): Promise<UserRelationDb> {
		return (await this.relationsService.updateRelation(user.ID, updateRelationDto));	
	}

	@Put('block')
	async blockRelation(
		@AuthUser() user: JWTData,
		@Body() blockRelationDto:CreateRelationDto
	): Promise<UserRelationDb> {
		return (await this.relationsService.blockRelation(user.ID, blockRelationDto));
	}

	@Delete()
	async deleteRelation(
		@AuthUser() user: JWTData,
		@Body() deleteRelationDto:DeleteRelationDto
	): Promise<{message: string}> {
		return (await this.relationsService.deleteRelation(user.ID, deleteRelationDto));	
	}

	//DEBUG ROUTES
	@Public()
	@Get()
	async getRelations(): Promise<UserRelationDb[]> {
		return (await this.relationsService.getAllRelations());
	}
}
