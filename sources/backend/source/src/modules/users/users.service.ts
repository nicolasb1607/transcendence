import { Injectable, BadRequestException, ConflictException, NotFoundException,
	Logger, InternalServerErrorException } from '@nestjs/common';
import { Prisma, type UserStatus } from '@prisma/client';
import { PrismaService } from "../../common/providers/prisma/prisma.service"
import { genSaltedHash } from './../../common/providers/encrypt';
import type { CreateUserDTO, UpdateUserDto, UpdateUserMetaDTO } from './users.dto';
import {levelExperience} from "./levelExperience"
import type { OauthUserDTO } from '../auth/auth.dto';
import type { TwoFAData } from '../auth/twoFA/twoFA.interface';
import type { 
	User,
	User2FA,
	UserDateStatus,
	UserDb,
	UserDetails,
	UserMeta,
	oauthUserDb,
	UsersStatus,
	PlayerStatusUpdate,
	UserMetaLine } from './users.interface';
import type { ApiToken, JWTData, Providers } from "../auth/auth.interface";
import type { Game } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import type { Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { unlinkSync } from 'fs';

type getUserKeys = "ID" | "login" | "email";
type userKeyValuePair = {
	ID?: number,
	login?: string,
	email?: string,
}

const userSelectFields =  {
	ID: true,
	login: true,
	email: true,
	role: true,
	status: true
}

//30min
const AWAY_TIME = 30 * 60 * 1000;


@Injectable()
export class UsersService {

	private connectedUsers:UserDateStatus[] = [];
	private socketIdToUserIdMap = new Map<string, number>();

	constructor(
		private readonly prisma: PrismaService,
		private readonly logger: Logger,
		private readonly eventEmitter: EventEmitter2,
		private jwtService: JwtService,
	) {
		this.logger = new Logger(UsersService.name);
	}

	/* --------------------- Connected User & Sockets  --------------------- */

	public getSocketIdToUserIdMap(): Map<string, number> {
		return (this.socketIdToUserIdMap);
	}

	public async onConnection(
		client: Socket,
	): Promise<JWTData|undefined> {
		this.logger.log(`Client connected: ${client.id}`);
		const token = client.handshake.auth.token;
		try {
			if (!token) throw new Error("No token provided");
			const payload:JWTData = await this.jwtService.verifyAsync(token);
			this.socketIdToUserIdMap.set(client.id, payload.ID);
			this.updateUserStatus(payload.ID, 'online');
			return (payload);
		} catch (e) {
			//check exception is working as intended
			client.emit('exception', {
				statusCode: 401,
				message: "Wrong token format, please check your request",
				error: "Unauthorized"
			});
			return (undefined);
		}
	}

	public onDisconnect(client: Socket): void {
		this.logger.log(`Client disconnected: ${client.id}`);
		const userId = this.socketIdToUserIdMap.get(client.id);
		if (!userId) return ;
		this.socketIdToUserIdMap.delete(client.id);
		if (this.getSocketIdFromUserId(userId)) return ;
		this.updateUserStatus(userId, 'offline');
	}

	public getSocketIdFromUserId(userId: number): string | undefined {
		for (const [socketId, id] of this.socketIdToUserIdMap) {
			if (id === userId) return (socketId);
		}
		return (undefined);
	}

	/* ------------------------- END  ------------------------- */

	async updateUserStatus(userId:number, status:UserStatus) {
		try {
			if (status === this.connectedUsers[userId]?.[0]) return ;
			await this.prisma.user.update({
				where: { ID: userId },
				data: { status }
			});
			this.logger.log(`User ${userId} is now ${status}`);
			this.connectedUsers[userId] = [
				status,
				new Date()
			];
			this.eventEmitter.emit('user.status.update', {
				userId,
				status
			} as PlayerStatusUpdate);
		} catch {}
	}

	async erasePrivateAvatarIfExist(userID: number) {
		try {
			const userMetaObj = await this.getUserMeta(userID);
			if (userMetaObj.avatar) {
				if (userMetaObj.avatar.includes("avatars/private/")) {
					const avatarUrl = userMetaObj.avatar;

					const filePath = avatarUrl.replace("avatars/", "./client/avatars/");
					unlinkSync(filePath);

					const bigFilePath = filePath.replace("/private/", "/private/big/");
					unlinkSync(bigFilePath);
				}
			}
		} catch (error) {
			throw new InternalServerErrorException('Failed to erase private avatar.');
		}
	}

	async upsertUserAvatar(userId: number, avatarValue: string) {
		try {
			await this.prisma.userMeta.upsert({
				where: {
					userId_metaKey: {
						userId,
						metaKey: 'avatar'
					}
				},
				create: {
					userId,
					metaKey: 'avatar',
					metaValue: avatarValue
				},
				update: {
					metaValue: avatarValue
				}
			});
		} catch (error) {
			throw new InternalServerErrorException('Failed to upsert user avatar.');
		}
	}

	async getUsersStatus(user?:JWTData):Promise<UsersStatus> {
		if (user) {
			await this.updateUserStatus(user.ID, 'online');
		}
		return (this.connectedUsers.map(([status, date]) => {
			if (status === "online" && date.getTime() + AWAY_TIME < Date.now()) {
				return ("away");
			}
			return (status);
		}));
	}

	private async createUserDefaultMeta(userId:number):Promise<void> {
		const defaultMeta = [
			{ metaKey: "experience", metaValue: JSON.stringify({level:0,exp:0}) },
			{ metaKey: "avatar", metaValue: "avatars/public/alliance_avatar2.jpg" },
			{ metaKey: "description", metaValue: "" },
		];
		try {
			console.log( defaultMeta.map(meta => ({ ...meta, userId })))
			await this.prisma.userMeta.createMany({
				data: defaultMeta.map(meta => ({ ...meta, userId }))
			});
		} catch (e) {
			this.logger.error(`createUserDefaultMeta: ${e}`);
		}
	}

	async createUser(userData: CreateUserDTO): Promise<User> {
		const conflictKey = await this.getConflicts({ login: userData.login, email: userData.email });
		if (conflictKey) {
			this.logger.error(`createUser: User '${conflictKey}' already exist`);
			throw new ConflictException(`User '${conflictKey}' already exist`);
		}
		try {
			const hashedPassword = await genSaltedHash(userData.password);
			userData.password = hashedPassword;
			const user = await this.prisma.user.upsert({
				where: {
					email: userData.email,
				},
				update: {
				},
				create: userData,
				select: userSelectFields
			});
			await this.createUserDefaultMeta(user.ID);
			return (user);
		} catch (e) {
			this.logger.error(`createUser: ${e}`);
			throw e;
		}
	}

	private async saveUserOAuth(newUser: OauthUserDTO, currentProvider: string, user: User): Promise<void> {
		const newExpiryDate = new Date();
		newExpiryDate.setHours(newExpiryDate.getHours() + 1);

		const userOauth = await this.prisma.userOauth.create({
			data: {
				userId: user.ID,
				provider: currentProvider,
				accessToken: newUser.accessToken,
				refreshToken: newUser.refreshToken,
				expiryDate: newExpiryDate
			}
		})
		this.logger.log(userOauth);
	}

	private async saveOAuthMeta(user: User, newUser: OauthUserDTO, currentProvider: Providers): Promise<void> {
		const userMeta = [
			{ metaKey: "experience", metaValue: JSON.stringify({level:0,exp:0}) },
			{ metaKey: "avatar", metaValue: "avatars/public/alliance_avatar2.jpg" },
			{ metaKey: "description", metaValue: "" },
			{ metaKey: "firstName", metaValue: newUser.firstName },
			{ metaKey: "lastName", metaValue: newUser.lastName },
		];
		if (currentProvider === "forty_two" && newUser?.userCoalition) {
			userMeta.push({ metaKey: `${currentProvider}_id`, metaValue: newUser.providerId.toString() });
			userMeta.push({ metaKey: "coalition", metaValue: newUser.userCoalition });
		}
		await this.prisma.userMeta.createMany({
			data: userMeta.map((meta) => ({...meta, userId: user.ID}))
		});
	}

	async createOauthUser(newUser: OauthUserDTO, currentProvider: Providers): Promise<User> {
		try {
		  this.logger.log(`createOauthUser: ${newUser.email} ${currentProvider}`)
	  
			const login = await this.generateUniqueLogin(newUser);

			const userData = {
				login,
				email: newUser.email,
				password: "",
			};
	  
			const user = await this.prisma.user.upsert({
				where: { email: newUser.email },
				update: {},
				create: userData,
				select: userSelectFields
			});
			await this.saveUserOAuth(newUser, currentProvider, user);
			await this.saveOAuthMeta(user, newUser, currentProvider);
			return user;

		} catch (e) {
			this.logger.error(e);
			throw e;
		}
	}

	async generateUniqueLogin(newUser: OauthUserDTO): Promise<string> {
		let login: string;
		if (newUser.login) {
			login = newUser.login.substring(0, 18);
		} else {
			const emailBeforeAt = newUser.email.split('@')[0];
			login = emailBeforeAt.substring(0, 18);
		}
	  
		let index = 0;
		while (true) {
			const candidateLogin = index === 0 ? login : `${login}#${index}`;
			const userWithLogin = await this.prisma.user.findUnique({
				where: { login: candidateLogin },
			});
			if (!userWithLogin) {
				return candidateLogin;
			}
			index++;
		}
	}


	async getUserMeta(userId:number):Promise<UserMeta> {
		const userMetaObj = {};
		const selectedUserMetaKeys = ["avatar", "experience", "coalition", "description",
			"firstName", "lastName"];
		const userMeta = await this.prisma.userMeta.findMany({
			where: {
				userId,
				metaKey: { in: selectedUserMetaKeys }
			},
			select: { metaKey:true, metaValue:true }
		});

		userMeta.forEach((metaRow) => {
			if (["experience"].includes(metaRow.metaKey)) {
				metaRow.metaValue = JSON.parse(metaRow.metaValue);
			}
			userMetaObj[metaRow.metaKey] = metaRow.metaValue;
		});
		return (userMetaObj);
	}

	async getUsers(): Promise<User[]> {
		const users = await this.prisma.user.findMany({
			select: userSelectFields
		}) as User[];
		return (users);
	}

	async	getEnhancedUsers(users:User[]): Promise<UserDetails[]> {
		const userIds = users.map(user => user.ID);
		const usersMeta = await this.prisma.userMeta.findMany({
			where: {
				userId: {
					in: userIds
				}
			},
			select: {
				userId: true,
				metaKey: true,
				metaValue: true
			}
		});
		return (users.map(user => {
			const userMeta = usersMeta.filter(userMeta => userMeta.userId === user.ID);
			const experience = userMeta.find(meta => meta.metaKey === "experience")?.metaValue;
			return ({
				...user,
				avatar: userMeta.find(meta => meta.metaKey === "avatar")?.metaValue,
				experience: experience ? JSON.parse(experience) : { level: 0, exp: 0 },
			})
		}));
	}

	async getUsersByIds(ids: number[], enhanced:boolean, select?:Prisma.UserSelect): Promise<User[]|Array<Partial<UserDetails>>> {
		const users = await this.prisma.user.findMany({
			where: {
				ID: {
					in: ids
				}
			},
			select: select || userSelectFields
		}) as User[]
		if (enhanced) return (await this.getEnhancedUsers(users));
		return (users);
	}

	/**
	 * From a part of a user's login or email, return all users that match
	 * with full-text search
	 */
	async searchUsers(username: string, enhanced:boolean, page?:number): Promise<User[]|UserDetails[]> {
		const limit = 5;
		const offset = page ? page * limit : 0;
		const whereClause: Prisma.UserWhereInput = {
			OR: [
				{ login: { contains: username, mode: 'insensitive' } },
				{ email: { contains: username, mode: 'insensitive' } }
			]
		};
		const users: User[] = await this.prisma.user.findMany({
			where: whereClause,
			select: userSelectFields,
			skip: offset,
			take: limit,
		});
		if (enhanced) return (await this.getEnhancedUsers(users));
		return (users);
	}

	async	getUserBy(
		key:getUserKeys,
		value:string|number,
		loadDetails = false,
		select?:Prisma.UserSelect
	): Promise<User|UserDetails|UserDb> {
		let whereClause: Prisma.UserWhereUniqueInput;

		switch (key) {
		case "ID":
			whereClause = { ID: value as number };
			break;
		case "login":
			whereClause = { login: value as string };
			break;
		case "email":
			whereClause = { email: value as string };
			break;
		default:
			throw new Error(`Invalid key: ${key}`);
		}

		try {
			const user = await this.prisma.user.findUniqueOrThrow({
				where: whereClause,
				select: select || userSelectFields
			}) as User;
			const userMeta = (user.ID && loadDetails) ? await this.getUserMeta(user.ID) : undefined;
			return ({...user,...userMeta})
		} catch (e) {
			this.logger.error("NO USER");
			if (e.code === 'P2025') {
				throw new NotFoundException("No User found", "NotFoundError");
			}
			throw e;
		}
	}
	
	async getUserByEmail(email: string): Promise<User2FA> {
		try {
			const user = await this.prisma.user.findFirstOrThrow({
				where: { email }
			})
			return (user);
		} catch (e) {
			this.logger.error("NO USER");
			if (e.code === 'P2025') {
				throw new NotFoundException("No User found", "NotFoundError");
			}
			throw e;
		}
	}

	async updateUser(id: number, userData: UpdateUserDto): Promise<User> {
		if(!(await this.testUserBy("ID", id))){
			this.logger.error(`updateUser: No User found with ID ${id}`);
			throw new BadRequestException("No User found", "NotFoundError");
		}
		const conflictKey = await this.getConflicts({ login: userData.login, email: userData.email });
		if (conflictKey) {
			this.logger.error(`updateUser: User ${conflictKey} already exist`);
			throw new ConflictException(`User ${conflictKey} already exist`);
		}
		try{
			let hashedPassword: string;

			if (userData.hasOwnProperty('password')) {
				hashedPassword = await genSaltedHash(userData.password);
				userData.password = hashedPassword;
			}
			const user: User = await this.prisma.user.update({
				where: { ID: id },
				data: userData,
				select: userSelectFields
			})
			return (user);
		} catch (e) {
			throw e;
		}
	}

	async getUserMetaLines(userID: number):Promise<UserMetaLine[]> {
		const userMetaLines = await this.prisma.userMeta.findMany({
			where: {
				userId: userID
			},
			select: {
				ID: true,
				userId: true,
				metaKey: true,
				metaValue: true
			}
		})
		return (userMetaLines);
	}


	async updateUserMeta(userID:number, userMeta: UpdateUserMetaDTO): Promise<ApiToken|undefined> {
		const actualUser = await this.getUserBy("ID", userID, true) as UserDetails;
		//Update Basic User Datas
		const apiToken:ApiToken = { accessToken: undefined };
		const newAvatar = userMeta.avatar;
		if (newAvatar && actualUser.avatar !== newAvatar) {
			await this.erasePrivateAvatarIfExist(userID);
		}

		const userDataKeys = ["login", "email", "password"];
		const userMetaKeys = ["firstName", "lastName", "avatar", "experience", "description"];
		const userDataObject:UpdateUserDto = {};
		const userMetaUpdateData: { key: string, value: string }[] = [];
		const userMetaCreateData:Prisma.UserMetaCreateManyInput[] = [];
		for (const [key, value] of Object.entries(userMeta)) {
			if (userDataKeys.includes(key) && actualUser[key] !== value) {
				userDataObject[key] = value;
			} else if (userMetaKeys.includes(key)) {
				//skip if value is the same
				if (key in actualUser && actualUser[key] === value) continue;
				//if value change and is defined
				if (key in actualUser && value !== undefined) {
					userMetaUpdateData.push({
						key,
						value
					});
				} else if (value !== undefined) {
					userMetaCreateData.push({
						userId: userID,
						metaKey: key,
						metaValue: value
					})
				}
			}
		}
		if (userDataObject.hasOwnProperty('email')) {
			const oAuthUser = await this.retrieveOauthByUserId(userID);
			if (oAuthUser) {
				throw new BadRequestException("You can't change your email while using Oauth", "Bad Request");
			}
		}
		await this.updateUser(userID, userDataObject);
		
		//--------Update MetaData
		if (userMetaUpdateData.length > 0) {
			const whereThenClause = userMetaUpdateData.map((data) => {
				return (Prisma.sql`WHEN '${Prisma.raw(data.key)}' THEN ${data.value}`);
			});
			await this.prisma.$executeRaw`
				UPDATE public."UserMeta"
					SET meta_value =
						CASE meta_key
						${Prisma.join(whereThenClause, ' ')}
						ELSE meta_value
					END
				WHERE user_id = ${Prisma.raw(userID.toString())};
			`;
		}
		if (userMetaCreateData.length > 0) {
			await this.prisma.userMeta.createMany({
				data: userMetaCreateData
			});
		}
		if (userDataObject.hasOwnProperty('login')) {
			const updateJwt: JWTData = 
				{
					login: userDataObject["login"],
					ID: userID,
					role: actualUser.role,
				}
			apiToken.accessToken = await this.jwtService.signAsync(updateJwt);
		}
		return (apiToken)
	}

	async update2FA(id: number, twoFAdata:TwoFAData): Promise<boolean> {
		try {
			await this.prisma.user.update({
				where: { ID:id },
				data: twoFAdata,
			})
			return (true);
		} catch (e) {
			if (e.code === 'P2025') {
				throw new NotFoundException("No User found", "NotFoundError");
			}
			throw e;
		}
	}

	async deleteUser(id: number): Promise<boolean> {
		try {
			await this.prisma.user.delete({
				where: { ID: id }
			})
			return (true);
		} catch (e) {
			if (e.code === 'P2025') {
				throw new NotFoundException("No User found", "NotFoundError");
			}
			throw e;
		}
	}

	async testUserBy(key:getUserKeys, value:string|number):Promise<User|undefined> {
		let whereClause : Prisma.UserWhereUniqueInput;
		if(key === "ID")
			whereClause = { ID: value as number };
		if(key === "login")
			whereClause = { login: value as string };
		if(key === "email")
			whereClause = { email: value as string };
		return (await this.prisma.user.findFirst({
			where: whereClause,
			select: userSelectFields
		}));
	}

	/**
	 * Find first user found with the given fields
	 * @returns the first field that is in conflict with the given fields or
	 * null if no conflict was found
	 */
	async getConflicts(fields:Prisma.UserWhereInput):Promise<keyof userKeyValuePair|null> {
		const user = await this.prisma.user.findFirst({
			where: {
				OR: [ fields ]
			},
			select: userSelectFields
		});
		if (!user) return (null);
		for (const key in fields) {
			if (user[key] === fields[key])
				return (key as keyof userKeyValuePair);
		}
	}
	
	//Login is actually the email
	async retrieveUserByLogin(username: string): Promise<UserDb> {
		try {
			const user: UserDb = await this.prisma.user.findFirstOrThrow({
				where: {
					OR: [
						{ email: username },
						{ login: username },
					]
				}
			})
			return (user);
		} catch (e) {
			if (e instanceof Prisma.PrismaClientKnownRequestError) {
				if (e.code === 'P2025') {
					this.logger.error(`retrieveUserByLogin: No User found with login ${username}`);
					throw new BadRequestException("No User found", "NotFoundError");
				}
			}
			throw e;
		}
	}

  
	async retrieveOauthByUserId(currentUserId: number, currentProvider?: string): Promise<oauthUserDb|null> {
		const provider = currentProvider ? { provider: currentProvider } : {};
		const oauthUser = await this.prisma.userOauth.findFirst({
			where: {
				userId: currentUserId,
				...provider
			}
		}) as oauthUserDb | null;
		return (oauthUser);
	}
  
	//return an array of gameHistory where player has played
	async getHistoryByPlayer(player: number): Promise<Game[]> {
		const historyList: Game[] = await this.prisma.game.findMany({
			where: {
				players: {
					has: player
				},
			}
		});
		return (historyList)
	}

	/**
	 * Update the user experience
	 * - On win score difference * 15 + 20
	 * - On lose score * 3 + 5
	 * @throws {NotFoundException} if no user was found
	 * @throws {Error} if the experience metaValue is not a valid JSON
	 */
	async updateUserExperience(userId: number, userScore:number, opponentScore:number): Promise<number> {
		const userExperience = await this.prisma.userMeta.findFirstOrThrow({
			where: {
				userId,
				metaKey: "experience"
			},
			select: { metaValue: true, ID: true }
		});
		const isWinner = userScore > opponentScore;
		const experience = isWinner ? (userScore - opponentScore) * 15 + 20 : userScore * 3 + 5;
		const parseUserExperience = JSON.parse(userExperience.metaValue);
		if (parseUserExperience.level >= levelExperience.length) return (parseUserExperience);
		const expForNextLevel = levelExperience[parseUserExperience.level];
		const newUserExp = parseUserExperience.exp + experience;
		if (newUserExp >= expForNextLevel) {
			parseUserExperience.level++;
			parseUserExperience.exp = newUserExp - expForNextLevel;
		} else {
			parseUserExperience.exp = newUserExp;
		}
		try {
			await this.prisma.userMeta.update({
				where: { ID: userExperience.ID },
				data: { metaValue: JSON.stringify(parseUserExperience) }
			})
			return (experience);
		} catch (e) {
			this.logger.error(`Cannot update user experience`);
		}
	}
}

