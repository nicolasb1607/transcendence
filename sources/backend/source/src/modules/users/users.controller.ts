import { Controller, Get, Post, Put, Body, Query, Param, ParseIntPipe, Delete, UnauthorizedException, BadRequestException, ParseBoolPipe, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserStatus } from '@prisma/client';
import { Throttle } from '@nestjs/throttler';
import { UsersService } from './users.service';
import { CreateUserDTO, UpdateUserDto, UpdateUserMetaDTO, UserIdsDTO, UserStatusDTO, enhancedDTO, pageDTO } from './users.dto';
import { UsersStatus } from "./users.interface";
import { Public } from '../auth/constants';
import { AuthUser } from '../../common/decorators/user.decorator';
import { AchievementService } from '../achievement/achievement.service';
import { RelationsService } from '../relations/relations.service';
import { StatsService } from '../stats/stats.service';
import { JWTData } from '../auth/auth.interface';
import type { ApiToken } from '../auth/auth.interface';
import type { Challenge, User, UserDb, UserDetails } from "./users.interface";
import type { userStat } from '../stats/stats.interface';
import type { Game } from '@prisma/client';
import { UserChallengeService } from './userChallenge.service';

const user2faFields = {
	ID: true,
	login: true,
	password: true,
	email: true,
	role: true,
	status: true,
	isTwoFAEnabled: true,
	TwoFASecret: true,
}

@Controller('api/users')
export class UsersController {
	constructor(
		private readonly logger: Logger,
		private readonly usersService: UsersService,
		private readonly userChallengeService: UserChallengeService,
		private readonly achievementService: AchievementService,
		private readonly relationService: RelationsService,
		private readonly statsService: StatsService,
		private readonly eventEmitter: EventEmitter2
	) {}

	@Public()
	@Get()
	async getUsers(): Promise<User[]> {
		const user = await this.usersService.getUsers();
		return (user);
	}
	
	@Get('status')
	async getStatus(
		@AuthUser() user: JWTData
	):Promise<UsersStatus> {
		return (await this.usersService.getUsersStatus(user));
	}

	@Post('updateStatus')
	async updateStatus(
		@AuthUser() user: JWTData,
		@Body() {status}: UserStatusDTO
	): Promise<void> {
		if (Object.keys(UserStatus).indexOf(status) === -1){
			throw new UnauthorizedException("Invalid status");
		}
		await this.usersService.updateUserStatus(user.ID, status);
	}

	/**
	 * Handle challenge response request
	 */
	@Get('challenge/accept/:userId')
	async acceptChallenge(
		@AuthUser() user: JWTData,
		@Param('userId', ParseIntPipe) userId: number,
		@Query('response', ParseBoolPipe) response?: boolean
	) {
		await this.userChallengeService.handleAcceptChallenge(user.ID, userId, response);
	}

	@Get('challenge')
	async getChallenge(
		@AuthUser() user: JWTData
	): Promise<Challenge[]> {
		return (await this.userChallengeService.getUserChallenges(user.ID));
	}


	@Get('challenge/cancel')
	async cancelChallenge(
		@AuthUser() user: JWTData
	) {
		const challenge = await this.userChallengeService.cancelRunningChallenge(user.ID);
		this.eventEmitter.emit('user.challenge.cancel', {
			challenger: user.ID,
			challenged: challenge.challenged,
		});
	}
	
	@Get('2faStatus')
	async getUser2faStatus(  
		@AuthUser() user: JWTData,
	):Promise<boolean|undefined> {
		const userData = await this.usersService.getUserBy("ID", user.ID, false, user2faFields) as UserDb;
		if (!userData)
			return undefined;
		return (userData.isTwoFAEnabled);
	}

	@Public()
	@Post('/list')
	async getUsersByIds(
		@Body() {ids}: UserIdsDTO,
		@Query('loadDetails') loadDetails?: string
	): Promise<User[]|Array<Partial<UserDetails>>> {
		return (await this.usersService.getUsersByIds(ids, loadDetails === 'true'));
	}

	@Get('search/:username')
	@Get('enhanced')
	async searchUsers(
		@AuthUser() user: JWTData,
		@Param('username') username: string,
		@Query() {enhanced} : enhancedDTO,
		@Query() {page} : pageDTO,
	): Promise<User[]> {
		const users = await this.usersService.searchUsers(username, enhanced, page);
		return (this.relationService.removeWhereBlocked(user?.ID, users));
	}


	@Get('leaderboard/winrate')
	async getLeaderboardWinrate() {
		return (await this.statsService.getLeaderboard());
	}


	@Public()
	@Get(':userid')
	@Get('loadDetails')
	async getUserById(
		@Param('userid', ParseIntPipe) id: number,
		@Query('loadDetails') loadDetails?: string
	): Promise<User|UserDetails> {
		if (id <= 0) throw new BadRequestException("Invalid user ID");
		return (await this.usersService.getUserBy("ID", id, loadDetails === "true"));
	}

	@Public()
	@Throttle(5, 900)
	@Post()
	async createUser(@Body() userData: CreateUserDTO): Promise<User> {
		return (await this.usersService.createUser(userData));
	}

	/**
	 * Update user including meta
	 */
	@Put('meta')
	async updateUserMeta(
		@AuthUser() user,
		@Body() userMetaData:UpdateUserMetaDTO
	): Promise<ApiToken|undefined> {
		if (Object.keys(userMetaData).length === 0) return (undefined);
		return (await this.usersService.updateUserMeta(user.ID, userMetaData));
	}
	
	
	@Put(':userid')
	async updateUser(
		@AuthUser() user: JWTData,
		@Param('userid', ParseIntPipe) id: number,
		@Body() userData: UpdateUserDto
	): Promise<User> {
		if (id <= 0) throw new BadRequestException("Invalid user ID");
		if (!user || (user.ID !== id && user.role !== 'admin')) {
			throw new UnauthorizedException("You can't update this user");
		}
		return (await this.usersService.updateUser(id, userData));
	}
	
	@Delete(':userid')
	async deleteUser(
		@AuthUser() user: JWTData,
		@Param('userid', ParseIntPipe) id : number
	): Promise<{message : string}> {
		if (id <= 0) throw new BadRequestException("Invalid user ID");
		if (!user || (user.ID !== id && user.role !== 'admin')) {
			throw new UnauthorizedException("You can't delete this user");
		}
		await this.usersService.deleteUser(id)
		return ({ message: "User deleted successfully." });
	}

	@Public()
	@Get(':userid/achievements')
	async getUserAchievements(@Param('userid', ParseIntPipe) id: number):Promise<number[]> {
		if (id <= 0) throw new BadRequestException("Invalid user ID");
		return (await this.achievementService.getUserAchievements(id, true) as number[]);
	}

	@Public()
	@Get(':userid/stats')
	async getUserStats(@Param('userid', ParseIntPipe) id: number):Promise<userStat> {
		if (id <= 0) throw new BadRequestException("Invalid user ID");
		return (await this.statsService.getEnhancedUserStats(id));
	}

	@Get(':userid/history')
	async getHistoryByPlayer(@Param('userid', ParseIntPipe) id: number): Promise<Game[]> {
		if (id <= 0) throw new BadRequestException("Invalid user ID");
		return (await this.usersService.getHistoryByPlayer(id));
	}
}