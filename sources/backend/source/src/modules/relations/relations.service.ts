import { Injectable, BadRequestException, Logger } from "@nestjs/common";
import { PrismaService } from "../../common/providers/prisma/prisma.service"
import type { Prisma } from '@prisma/client';
import type { SessionRelation, UserRelation, UserRelationDb} from "./relations.interfaces";
import type { User, UserDetails } from "../users/users.interface";
import { UsersService } from "../users/users.service";
import type { CreateRelationDto, DeleteRelationDto } from "./relations.dto";
import { EventEmitter2 } from "@nestjs/event-emitter";


const userRelationSelectFields = {
	ID: true,
	userId: true,
	relationId: true,
	status: true
}

@Injectable()
export class RelationsService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly usersService: UsersService,
		private readonly logger: Logger,
		private readonly eventEmitter: EventEmitter2
	) {
		this.logger = new Logger(RelationsService.name);
	}

	/**
	 * Send relation update to the target user
	 * @emits user.session.update
	 */
	private async handleUserUpdateRelation(targetId:number, notification?:string){
		this.eventEmitter.emit('user.session.update', targetId, notification);
	}

	async getAllRelations():Promise<UserRelationDb[]> {
		const allRelations = await this.prisma.userRelation.findMany({
			select: userRelationSelectFields
		}) as UserRelationDb[];
		return (allRelations);
	}

	/**
	 * @param userID Id of the person who make the request
	 * @param targetId Id of the person who owns relations
	 */
	async getUserRelation(userID:number, targetId:number):Promise<SessionRelation> {
		if (!(await this.usersService.testUserBy("ID", targetId))){
			this.logger.error(`updateUserRelation: No User found with ID ${targetId}`);
			throw new BadRequestException("Targeted userId does not exist", "NotFoundError");
		}
		let userRelations;
		if (userID === targetId) {
			const userDbRelations:UserRelationDb[] = await this.getDbUserRelation([
				{ userId: userID },
				{ relationId: userID }
			])
			userRelations = await this.foundUsers(targetId, userDbRelations);
		} else {
			const userDbRelations = await this.getDbUserRelation([
				{ userId: targetId, status: 'friend' },
				{ relationId: targetId, status: 'friend' }
			])
			userRelations = await this.foundUsers(targetId, userDbRelations);
		}
		const sessionRelation = {
			blocked: [],
			friend: [],
			requested: [],
			requesting: []
		}
		userRelations.forEach((relation:UserRelation) => {
			if (targetId !== relation.userId) {
				sessionRelation[relation.friendship].push(relation.userId);
			}
		})
		return (sessionRelation);
	}

	async createRelation(userID:number, createRelationDto:CreateRelationDto):Promise<UserRelationDb> {
		if (!(await this.usersService.testUserBy("ID", createRelationDto.relationId))){
			this.logger.error(`updateUserRelation: No User found with ID ${createRelationDto.relationId}`);
			throw new BadRequestException("Targeted userId does not exist", "NotFoundError");
		}
		if (await this.isRelationExisting(userID, createRelationDto.relationId)) {
			this.logger.error(`updateUserRelation: Relation already exists`);
			throw new BadRequestException("Relation already exists", "ConflictError");
		}
		try {
			const relation = await this.prisma.userRelation.create({
				data: {
					userId: userID,
					relationId: createRelationDto.relationId,
					status: createRelationDto.status
				},
				select: userRelationSelectFields
			}) as UserRelationDb;
			const notification = createRelationDto.status === 'requesting' ?
				"You have just received a new friend request" : undefined;
			this.handleUserUpdateRelation(createRelationDto.relationId, notification);
			return (relation);
		} catch (e) {
			throw e;
		}
	}

	async updateRelation(userID:number, createRelationDto:CreateRelationDto):Promise<UserRelationDb> {
		const checkRelation = await this.isRelationExisting(userID, createRelationDto.relationId);
		if (!checkRelation) {
			this.logger.error(`updateUserRelation: No relation found`);
			throw new BadRequestException("No relation found", "NotFoundError");
		}
		if (await this.isUserBlocked(userID, createRelationDto.relationId)) {
			this.logger.error(`updateUserRelation: You are blocked by this user`);
			throw new BadRequestException("You are blocked by this user", "BlockedError");
		}
		else if (checkRelation.status === createRelationDto.status) {
			this.logger.error(`updateUserRelation: Relation up to date`);
			throw new BadRequestException("Relation up to date", "NoUpdateError");
		}
		try {
			const relation = await this.prisma.userRelation.update({
				where: {
					ID: checkRelation.ID
				},
				data: {
					status: createRelationDto.status
				},
				select: userRelationSelectFields
			}) as UserRelationDb;
			const notification = createRelationDto.status === 'friend' ?
				"You have a new friend" : undefined;
			this.handleUserUpdateRelation(createRelationDto.relationId, notification);
			return (relation);
		} catch (e) {
			throw e;
		}
	}

	async blockRelation(userID:number, createRelationDto:CreateRelationDto):Promise<UserRelationDb> {
		const checkRelation = await this.isRelationExisting(userID, createRelationDto.relationId);
		if (checkRelation && await this.isUserBlocked(userID, createRelationDto.relationId)) {
			this.logger.error(`blockUserRelation: You are already blocked by this user`);
			throw new BadRequestException("You are already blocked by this user", "BlockedError");
		}
		else if (checkRelation && checkRelation.status === createRelationDto.status) {
			this.logger.error(`blockUserRelation: Relation up to date`);
			throw new BadRequestException("Relation up to date", "NoUpdateError");
		}
		else if (checkRelation){
			await this.prisma.userRelation.delete({
				where: {
					ID: checkRelation.ID
				}
			})
		}
		try {
			const relation = await this.createRelation(userID, createRelationDto);
			return (relation);
		} catch (e) {
			throw e;
		}
	}

	async deleteRelation(userID:number, deleteRelationDto:DeleteRelationDto):Promise<{message: string}> {
		const checkRelation = await this.isRelationExisting(userID, deleteRelationDto.relationId);
		if (!checkRelation) {
			this.logger.error(`deleteUserRelation: No relation found`);
			throw new BadRequestException("No relation found", "NotFoundError");
		}
		if (await this.isUserBlocked(userID, deleteRelationDto.relationId)) {
			this.logger.error(`deleteUserRelation: You are blocked by this user`);
			throw new BadRequestException("You are blocked by this user", "BlockedError");
		}
		try {
			await this.prisma.userRelation.delete({
				where: {
					ID: checkRelation.ID
				}
			})
			this.handleUserUpdateRelation(deleteRelationDto.relationId);
			return ({message: "Relation successfully deleted"});
		} catch (e) {
			throw e;
		}
	}
	
	/**
	 * Define if a user is blocked by another user
	 * @param userID User who've been blocked
	 * @param targetId User who blocked
	 */
	async isUserBlocked(userID:number, targetId:number):Promise<boolean> {
		const userRelation = await this.prisma.userRelation.findFirst({
			where: {
				userId: targetId,
				relationId: userID,
			},
			select : userRelationSelectFields
		});
		if (userRelation && userRelation.status === 'blocked')
			return (true);
		return (false);
	}

	//------------------PRIVATE METHODS------------------//


	private async isRelationExisting(userID:number, targetId:number):Promise<UserRelationDb|undefined> {
		const userRelation = await this.prisma.userRelation.findFirst({
			where: {
				OR: [
					{userId: userID, relationId: targetId },
					{userId: targetId, relationId: userID }
				]
			},
			select : userRelationSelectFields 
		});
		return (userRelation as UserRelationDb);
	}

	private async getDbUserRelation(OrClause:Prisma.UserRelationWhereInput[]):Promise<UserRelationDb[]> {
		return (await this.prisma.userRelation.findMany({
			where: {
				OR: OrClause
			},
			select: userRelationSelectFields
		}) as UserRelationDb[]);
	}

	private foundUsers = async (userID:number, userRelations:UserRelationDb[]):Promise<UserRelation[]> => {
		const filteredIds = this.filterIds(userID, userRelations);
		const userDetails = await this.usersService.getUsersByIds(filteredIds, true);
		const foundUsersMap:UserRelation[] = userDetails.map((u) => {
			const relation = userRelations.find((user) => user.userId === u.ID || user.relationId === u.ID);
			return (this.cleanFields(u, relation));
		})
		return (foundUsersMap);
	}

	private filterIds = (targetId:number, relations:UserRelationDb[]):number[] => {
		const filteredIds:number[] = [];
		relations.forEach((relation) => {
			if (relation.relationId === targetId && relation.status == 'blocked')
				return ;
			else if (relation.userId === targetId)
				filteredIds.push(relation.relationId);
			else if (relation.relationId === targetId)	
				filteredIds.push(relation.userId);
		})
		return (filteredIds);
	}

	
	private cleanFields = (user:UserDetails, relation:UserRelationDb):UserRelation => {
		if (relation.status == 'requesting' && relation.userId === user.ID)
			relation.status = 'requested';
		const newObject = {
			...user,
			...relation,
			avatar: user.avatar,
			level: user.experience.level,
			friendship: relation.status,
		};
		delete newObject.email;
		delete newObject.role;
		delete newObject.experience;
		delete newObject.status;
		delete newObject.relationId;
		newObject.userId = user.ID;
		return (newObject);
	}
	

	//------------------PUBLIC  METHODS------------------//

	public async removeWhereBlocked(userId:number, users:UserDetails[]|User[]):Promise<UserDetails[]|User[]> {
		if (users.length === 0)
			return (users);
		const whereUserIsBlocked = await this.prisma.userRelation.findMany({
			where: {
				relationId: userId,
				userId: {
					in: users.map((u) => u.ID)
				},
				status: 'blocked'
			},
			select: {
				userId: true
			}
		});
		return (users.filter((user) => !whereUserIsBlocked.find((u) => u.userId === user.ID)));
	}
}